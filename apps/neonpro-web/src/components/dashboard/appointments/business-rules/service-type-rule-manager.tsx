"use client";

// =============================================
// NeonPro Service Type Rules Management
// Story 1.2: Business rules configuration
// =============================================

import type { ServiceTypeRule, ServiceTypeRuleConfig } from "@/app/lib/types/conflict-prevention";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import type {
  AlertCircle,
  Clock,
  Edit,
  Plus,
  Save,
  Settings,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";

interface ServiceTypeRuleManagerProps {
  clinicId: string;
  onRulesChange?: (rules: ServiceTypeRule[]) => void;
}

export function ServiceTypeRuleManager({ clinicId, onRulesChange }: ServiceTypeRuleManagerProps) {
  // State management
  const [rules, setRules] = useState<ServiceTypeRule[]>([]);
  const [services, setServices] = useState<Array<{ id: string; name: string }>>([]);
  const [professionals, setProfessionals] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ServiceTypeRule | null>(null);
  const [formData, setFormData] = useState<ServiceTypeRuleConfig>({
    service_type_id: "",
    minimum_duration: 30,
    maximum_duration: 180,
    buffer_before: 0,
    buffer_after: 0,
    max_daily_bookings: undefined,
    requires_specific_professional: false,
    allowed_professional_ids: [],
    minimum_advance_hours: 0,
    maximum_advance_days: 90,
    allow_same_day: true,
    description: "",
  });

  // Load data on mount
  useEffect(() => {
    Promise.all([loadRules(), loadServices(), loadProfessionals()]);
  }, [clinicId]);

  const loadRules = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/clinic/${clinicId}/service-rules`);

      if (response.ok) {
        const data = await response.json();
        setRules(data);
        onRulesChange?.(data);
      }
    } catch (error) {
      console.error("Error loading service rules:", error);
      toast.error("Erro ao carregar regras de serviços");
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await fetch(`/api/clinic/${clinicId}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.map((s: any) => ({ id: s.id, name: s.name })));
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const loadProfessionals = async () => {
    try {
      const response = await fetch(`/api/clinic/${clinicId}/professionals`);
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (error) {
      console.error("Error loading professionals:", error);
    }
  };

  const openDialog = (rule?: ServiceTypeRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        service_type_id: rule.service_type_id,
        minimum_duration: rule.minimum_duration,
        maximum_duration: rule.maximum_duration,
        buffer_before: rule.buffer_before,
        buffer_after: rule.buffer_after,
        max_daily_bookings: rule.max_daily_bookings,
        requires_specific_professional: rule.requires_specific_professional,
        allowed_professional_ids: rule.allowed_professional_ids || [],
        minimum_advance_hours: rule.minimum_advance_hours,
        maximum_advance_days: rule.maximum_advance_days,
        allow_same_day: rule.allow_same_day,
        description: rule.description || "",
      });
    } else {
      setEditingRule(null);
      setFormData({
        service_type_id: "",
        minimum_duration: 30,
        maximum_duration: 180,
        buffer_before: 0,
        buffer_after: 0,
        max_daily_bookings: undefined,
        requires_specific_professional: false,
        allowed_professional_ids: [],
        minimum_advance_hours: 0,
        maximum_advance_days: 90,
        allow_same_day: true,
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingRule(null);
  };

  const saveRule = async () => {
    try {
      // Basic validation
      if (!formData.service_type_id) {
        toast.error("Selecione um tipo de serviço");
        return;
      }

      if (formData.minimum_duration > formData.maximum_duration) {
        toast.error("Duração mínima deve ser menor que duração máxima");
        return;
      }

      if (
        formData.requires_specific_professional &&
        formData.allowed_professional_ids.length === 0
      ) {
        toast.error(
          'Selecione pelo menos um profissional quando "Requer profissional específico" está ativo',
        );
        return;
      }

      const method = editingRule ? "PUT" : "POST";
      const url = editingRule
        ? `/api/clinic/${clinicId}/service-rules/${editingRule.id}`
        : `/api/clinic/${clinicId}/service-rules`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save rule");
      }

      const savedRule = await response.json();

      if (editingRule) {
        setRules((prev) => prev.map((r) => (r.id === editingRule.id ? savedRule : r)));
        toast.success("Regra atualizada com sucesso!");
      } else {
        setRules((prev) => [...prev, savedRule]);
        toast.success("Regra adicionada com sucesso!");
      }

      closeDialog();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error("Erro ao salvar regra");
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/clinic/${clinicId}/service-rules/${ruleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete rule");
      }

      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      toast.success("Regra removida com sucesso!");
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error("Erro ao remover regra");
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/clinic/${clinicId}/service-rules/${ruleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rule status");
      }

      setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, is_active: isActive } : r)));

      toast.success(`Regra ${isActive ? "ativada" : "desativada"} com sucesso!`);
    } catch (error) {
      console.error("Error updating rule status:", error);
      toast.error("Erro ao atualizar status da regra");
    }
  };

  const getServiceName = (serviceId: string): string => {
    const service = services.find((s) => s.id === serviceId);
    return service?.name || "Serviço não encontrado";
  };

  const getProfessionalNames = (professionalIds: string[]): string[] => {
    return professionalIds.map((id) => {
      const professional = professionals.find((p) => p.id === id);
      return professional?.name || "Profissional não encontrado";
    });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
  };

  const formatAdvanceTime = (rule: ServiceTypeRule): string => {
    if (!rule.allow_same_day && rule.minimum_advance_hours === 0) {
      return "Não permite agendamento no mesmo dia";
    }

    if (rule.minimum_advance_hours === 0) {
      return "Permite agendamento imediato";
    }

    if (rule.minimum_advance_hours >= 24) {
      const days = Math.floor(rule.minimum_advance_hours / 24);
      return `Mín. ${days} dia${days > 1 ? "s" : ""} de antecedência`;
    }

    return `Mín. ${rule.minimum_advance_hours}h de antecedência`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 animate-spin" />
            <span>Carregando regras...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Regras de Tipos de Serviços
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRule ? "Editar" : "Criar"} Regra de Serviço</DialogTitle>
                <DialogDescription>
                  Configure restrições e parâmetros específicos para tipos de serviços.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Service Selection */}
                <div>
                  <Label>Tipo de Serviço *</Label>
                  <Select
                    value={formData.service_type_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        service_type_id: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Configurações de Duração
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Duração mínima (min) *</Label>
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        value={formData.minimum_duration}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            minimum_duration: parseInt(e.target.value) || 30,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Duração máxima (min) *</Label>
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        value={formData.maximum_duration}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            maximum_duration: parseInt(e.target.value) || 180,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Buffer antes (min)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="5"
                        value={formData.buffer_before}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            buffer_before: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Buffer depois (min)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="5"
                        value={formData.buffer_after}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            buffer_after: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Limits */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Limites de Agendamento
                  </h4>
                  <div>
                    <Label>Máximo de agendamentos por dia</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.max_daily_bookings || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          max_daily_bookings: e.target.value ? parseInt(e.target.value) : undefined,
                        }))
                      }
                      placeholder="Deixe vazio para sem limite"
                    />
                  </div>
                </div>

                {/* Professional Requirements */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Requisitos de Profissionais
                  </h4>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.requires_specific_professional}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          requires_specific_professional: checked,
                          allowed_professional_ids: checked ? prev.allowed_professional_ids : [],
                        }))
                      }
                    />
                    <Label>Requer profissional específico</Label>
                  </div>

                  {formData.requires_specific_professional && (
                    <div>
                      <Label>Profissionais autorizados</Label>
                      <Select
                        value=""
                        onValueChange={(professionalId) => {
                          if (!formData.allowed_professional_ids.includes(professionalId)) {
                            setFormData((prev) => ({
                              ...prev,
                              allowed_professional_ids: [
                                ...prev.allowed_professional_ids,
                                professionalId,
                              ],
                            }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Adicionar profissional" />
                        </SelectTrigger>
                        <SelectContent>
                          {professionals
                            .filter((p) => !formData.allowed_professional_ids.includes(p.id))
                            .map((professional) => (
                              <SelectItem key={professional.id} value={professional.id}>
                                {professional.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      {formData.allowed_professional_ids.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getProfessionalNames(formData.allowed_professional_ids).map(
                            (name, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => {
                                  const professionalId = formData.allowed_professional_ids[index];
                                  setFormData((prev) => ({
                                    ...prev,
                                    allowed_professional_ids: prev.allowed_professional_ids.filter(
                                      (id) => id !== professionalId,
                                    ),
                                  }));
                                }}
                              >
                                {name} ×
                              </Badge>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Advance Booking */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Agendamento Antecipado</h4>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.allow_same_day}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          allow_same_day: checked,
                          minimum_advance_hours: checked ? prev.minimum_advance_hours : 24,
                        }))
                      }
                    />
                    <Label>Permite agendamento no mesmo dia</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Mínimo antecedência (horas)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.minimum_advance_hours}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            minimum_advance_hours: parseInt(e.target.value) || 0,
                          }))
                        }
                        disabled={!formData.allow_same_day && formData.minimum_advance_hours < 24}
                      />
                    </div>
                    <div>
                      <Label>Máximo antecedência (dias)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.maximum_advance_days}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            maximum_advance_days: parseInt(e.target.value) || 90,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label>Descrição/Observações</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Detalhes adicionais sobre esta regra..."
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button onClick={saveRule}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Regra
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma regra configurada</p>
              <p className="text-sm">
                Clique em "Nova Regra" para criar restrições específicas por tipo de serviço
              </p>
            </div>
          ) : (
            rules.map((rule) => {
              const serviceName = getServiceName(rule.service_type_id);
              const professionalNames = getProfessionalNames(rule.allowed_professional_ids || []);

              return (
                <Card key={rule.id} className={!rule.is_active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{serviceName}</h4>
                          {!rule.is_active && (
                            <Badge variant="outline" className="text-xs">
                              Inativa
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Duração: {formatDuration(rule.minimum_duration)} -{" "}
                              {formatDuration(rule.maximum_duration)}
                            </div>
                            {(rule.buffer_before > 0 || rule.buffer_after > 0) && (
                              <div className="text-xs">
                                Buffer: {rule.buffer_before}min antes, {rule.buffer_after}min depois
                              </div>
                            )}
                            {rule.max_daily_bookings && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Máx: {rule.max_daily_bookings} agendamentos/dia
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div>{formatAdvanceTime(rule)}</div>
                            <div className="text-xs">
                              Máx: {rule.maximum_advance_days} dias de antecedência
                            </div>
                            {rule.requires_specific_professional && (
                              <div className="text-xs">
                                <UserCheck className="h-3 w-3 inline mr-1" />
                                Profissionais: {professionalNames.join(", ") || "Nenhum"}
                              </div>
                            )}
                          </div>
                        </div>

                        {rule.description && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {rule.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                        />
                        <Button variant="ghost" size="sm" onClick={() => openDialog(rule)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRule(rule.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {rules.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700">
                <p className="font-medium mb-1">Como funcionam as regras:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <strong>Duração:</strong> Define limites mín/máx para o serviço
                  </li>
                  <li>
                    <strong>Buffer:</strong> Tempo adicional antes/depois do agendamento
                  </li>
                  <li>
                    <strong>Limites diários:</strong> Controla quantidade de agendamentos por dia
                  </li>
                  <li>
                    <strong>Profissionais específicos:</strong> Restringe quem pode executar o
                    serviço
                  </li>
                  <li>
                    <strong>Antecedência:</strong> Define quando é possível agendar
                  </li>
                  <li>Regras inativas não são aplicadas na validação</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
