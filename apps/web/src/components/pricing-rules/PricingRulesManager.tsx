import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import {
  useDeletePricingRule,
  usePricingRules,
  useTogglePricingRule,
} from "@/hooks/usePricingRules";
import type { PricingRule } from "@/types/pricing-rules";
import { Input } from "@neonpro/ui";
import { Button } from "@neonpro/ui";
import {
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PricingRuleForm } from "./PricingRuleForm";
import { PricingRuleStats } from "./PricingRuleStats";

export function PricingRulesManager() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  const clinicId = user?.user_metadata?.clinic_id;

  const { data: rules = [], isLoading } = usePricingRules(clinicId, {
    search: searchQuery || undefined,
  });

  const deleteRule = useDeletePricingRule();
  const toggleRule = useTogglePricingRule();

  const filteredRules = rules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteRule = async (rule: PricingRule) => {
    if (!confirm(`Tem certeza que deseja excluir a regra "${rule.name}"?`)) {
      return;
    }

    try {
      await deleteRule.mutateAsync(rule.id);
      toast.success("Regra de preço excluída com sucesso");
    } catch (error) {
      console.error("Failed to delete pricing rule:", error);
      toast.error("Erro ao excluir regra de preço");
    }
  };

  const handleToggleRule = async (rule: PricingRule) => {
    try {
      await toggleRule.mutateAsync({ id: rule.id, isActive: !rule.is_active });
      toast.success(
        `Regra ${rule.is_active ? "desativada" : "ativada"} com sucesso`,
      );
    } catch (error) {
      console.error("Failed to toggle pricing rule:", error);
      toast.error("Erro ao alterar status da regra");
    }
  };

  const getRuleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      time_based: "Baseada em Tempo",
      professional_specific: "Específica do Profissional",
      service_specific: "Específica do Serviço",
      client_loyalty: "Fidelidade do Cliente",
      bulk_discount: "Desconto em Lote",
      seasonal: "Sazonal",
      first_time_client: "Primeiro Atendimento",
      conditional: "Condicional",
    };
    return labels[type] || type;
  };

  const getRuleTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      time_based: "bg-blue-100 text-blue-800",
      professional_specific: "bg-green-100 text-green-800",
      service_specific: "bg-purple-100 text-purple-800",
      client_loyalty: "bg-yellow-100 text-yellow-800",
      bulk_discount: "bg-orange-100 text-orange-800",
      seasonal: "bg-pink-100 text-pink-800",
      first_time_client: "bg-indigo-100 text-indigo-800",
      conditional: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar regras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowStatsDialog(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Estatísticas
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Regra de Preço</DialogTitle>
                <DialogDescription>
                  Configure uma nova regra dinâmica de preços
                </DialogDescription>
              </DialogHeader>
              <PricingRuleForm
                onSuccess={() => setShowCreateDialog(false)}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rules Grid */}
      {filteredRules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-muted-foreground text-center">
              <h3 className="font-medium mb-2">Nenhuma regra encontrada</h3>
              <p className="text-sm">
                {searchQuery
                  ? "Tente ajustar sua busca ou criar uma nova regra"
                  : "Comece criando sua primeira regra de preço"}
              </p>
            </div>
            {!searchQuery && (
              <Button
                className="mt-4"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Regra
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRules.map((rule) => (
            <Card
              key={rule.id}
              className={`${!rule.is_active ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getRuleTypeColor(rule.rule_type)}>
                        {getRuleTypeLabel(rule.rule_type)}
                      </Badge>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingRule(rule)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleRule(rule)}>
                        {rule.is_active ? (
                          <ToggleLeft className="h-4 w-4 mr-2" />
                        ) : (
                          <ToggleRight className="h-4 w-4 mr-2" />
                        )}
                        {rule.is_active ? "Desativar" : "Ativar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteRule(rule)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {rule.description && (
                    <CardDescription>{rule.description}</CardDescription>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prioridade:</span>
                    <span className="font-medium">{rule.priority}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tipo de Ajuste:
                    </span>
                    <span className="font-medium">
                      {rule.adjustment.type === "percentage"
                        ? "Percentual"
                        : "Valor Fixo"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium">
                      {rule.adjustment.type === "percentage"
                        ? `${rule.adjustment.value > 0 ? "+" : ""}${rule.adjustment.value}%`
                        : `R$ ${rule.adjustment.value.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Regra de Preço</DialogTitle>
            <DialogDescription>
              Modifique as configurações da regra de preço
            </DialogDescription>
          </DialogHeader>
          {editingRule && (
            <PricingRuleForm
              rule={editingRule}
              onSuccess={() => setEditingRule(null)}
              onCancel={() => setEditingRule(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Estatísticas de Regras de Preço</DialogTitle>
            <DialogDescription>
              Análise detalhada das regras de preço da clínica
            </DialogDescription>
          </DialogHeader>
          {clinicId && <PricingRuleStats clinicId={clinicId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
