import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreatePricingRule,
  useUpdatePricingRule,
} from "@/hooks/usePricingRules";
import type { PricingRule } from "@/types/pricing-rules";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@neonpro/ui";
import { Input, Label } from "@neonpro/ui";
import { Button } from "@neonpro/ui";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const pricingRuleSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  rule_type: z.enum([
    "time_based",
    "professional",
    "duration",
    "package",
    "seasonal",
    "loyalty",
    "first_time",
    "group",
  ]),
  adjustment_type: z.enum(["percentage", "fixed_amount", "override"]),
  adjustment_value: z.number(),
  priority: z.number().min(1).max(100),
  is_active: z.boolean(),
  conditions: z
    .array(
      z.object({
        field: z.string(),
        operator: z.enum([
          "equals",
          "greater_than",
          "less_than",
          "between",
          "in",
          "not_in",
        ]),
        value: z.union([
          z.string(),
          z.number(),
          z.array(z.string()),
          z.array(z.number()),
        ]),
      }),
    )
    .optional(),
  service_ids: z.array(z.string()).optional(),
  professional_ids: z.array(z.string()).optional(),
  time_conditions: z.record(z.any()).optional(),
  usage_limits: z.record(z.any()).optional(),
});

type PricingRuleFormData = z.infer<typeof pricingRuleSchema>;

interface PricingRuleFormProps {
  rule?: PricingRule;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PricingRuleForm({
  rule,
  onSuccess,
  onCancel,
}: PricingRuleFormProps) {
  const { user } = useAuth();
  const createRule = useCreatePricingRule();
  const updateRule = useUpdatePricingRule();

  const clinicId = user?.user_metadata?.clinic_id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PricingRuleFormData>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      name: rule?.name || "",
      description: rule?.description || "",
      rule_type: rule?.rule_type || "time_based",
      adjustment_type: rule?.adjustment?.type || "percentage",
      adjustment_value: rule?.adjustment?.value || 0,
      priority: rule?.priority || 50,
      is_active: rule?.is_active ?? true,
      conditions: rule?.conditions || [],
      service_ids: rule?.service_ids || [],
      professional_ids: rule?.professional_ids || [],
      time_conditions: rule?.time_conditions || {},
      usage_limits: rule?.usage_limits || {},
    },
  });

  const ruleType = watch("rule_type");
  const adjustmentType = watch("adjustment_type");

  const onSubmit = async (data: PricingRuleFormData) => {
    if (!clinicId) {
      toast.error("Clínica não identificada");
      return;
    }

    try {
      // Transform form data to API format
      const requestData = {
        name: data.name,
        description: data.description,
        rule_type: data.rule_type,
        priority: data.priority,
        is_active: data.is_active,
        conditions: data.conditions || [],
        adjustment: {
          type: data.adjustment_type,
          value: data.adjustment_value,
          description: data.description,
        },
        service_ids: data.service_ids,
        professional_ids: data.professional_ids,
        time_conditions: data.time_conditions,
        usage_limits: data.usage_limits,
      };

      if (rule) {
        await updateRule.mutateAsync({
          id: rule.id,
          request: requestData,
        });
        toast.success("Regra de preço atualizada com sucesso");
      } else {
        await createRule.mutateAsync({
          clinicId,
          request: requestData,
        });
        toast.success("Regra de preço criada com sucesso");
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to submit pricing rule form:", error);
      toast.error(rule ? "Erro ao atualizar regra" : "Erro ao criar regra");
    }
  };

  const ruleTypeOptions = [
    {
      value: "time_based",
      label: "Baseada em Tempo",
      description: "Preços diferentes por horário/dia",
    },
    {
      value: "professional_specific",
      label: "Específica do Profissional",
      description: "Preços por profissional",
    },
    {
      value: "service_specific",
      label: "Específica do Serviço",
      description: "Preços por tipo de serviço",
    },
    {
      value: "client_loyalty",
      label: "Fidelidade do Cliente",
      description: "Descontos para clientes fiéis",
    },
    {
      value: "bulk_discount",
      label: "Desconto em Lote",
      description: "Descontos por quantidade",
    },
    { value: "seasonal", label: "Sazonal", description: "Preços sazonais" },
    {
      value: "first_time_client",
      label: "Primeiro Atendimento",
      description: "Desconto para novos clientes",
    },
    {
      value: "conditional",
      label: "Condicional",
      description: "Regras com condições específicas",
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Regra</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ex: Desconto Horário Comercial"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descreva quando e como esta regra será aplicada"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rule_type">Tipo de Regra</Label>
          <Select
            value={watch("rule_type")}
            onValueChange={(value) => setValue("rule_type", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de regra" />
            </SelectTrigger>
            <SelectContent>
              {ruleTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adjustment_type">Tipo de Ajuste</Label>
            <Select
              value={adjustmentType}
              onValueChange={(value) =>
                setValue("adjustment_type", value as any)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentual (%)</SelectItem>
                <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment_value">
              Valor do Ajuste {adjustmentType === "percentage" ? "(%)" : "(R$)"}
            </Label>
            <Input
              id="adjustment_value"
              type="number"
              step={adjustmentType === "percentage" ? "0.1" : "0.01"}
              {...register("adjustment_value", { valueAsNumber: true })}
              placeholder={adjustmentType === "percentage" ? "10" : "50.00"}
            />
            {errors.adjustment_value && (
              <p className="text-sm text-destructive">
                {errors.adjustment_value.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade (1-100)</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            max="100"
            {...register("priority", { valueAsNumber: true })}
            placeholder="50"
          />
          <p className="text-sm text-muted-foreground">
            Maior prioridade = aplicada primeiro. Use 100 para máxima
            prioridade.
          </p>
          {errors.priority && (
            <p className="text-sm text-destructive">
              {errors.priority.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={watch("is_active")}
            onCheckedChange={(checked) => setValue("is_active", checked)}
          />
          <Label htmlFor="is_active">Regra ativa</Label>
        </div>
      </div>

      {/* Rule Type Specific Configuration */}
      {ruleType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurações Específicas</CardTitle>
            <CardDescription>
              Configure os parâmetros específicos para este tipo de regra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {ruleType === "time_based" && (
                <p>
                  Configure horários e dias específicos para aplicar esta regra.
                </p>
              )}
              {ruleType === "professional" && (
                <p>
                  Selecione os profissionais que terão preços diferenciados.
                </p>
              )}
              {ruleType === "duration" && (
                <p>Configure preços baseados na duração do serviço.</p>
              )}
              {ruleType === "loyalty" && (
                <p>
                  Defina critérios de fidelidade (número de consultas, tempo
                  como cliente, etc.).
                </p>
              )}
              {ruleType === "package" && (
                <p>
                  Configure descontos progressivos baseados na quantidade de
                  serviços.
                </p>
              )}
              {ruleType === "seasonal" && (
                <p>
                  Defina períodos sazonais e seus respectivos ajustes de preço.
                </p>
              )}
              {ruleType === "first_time" && (
                <p>Configuração automática para novos clientes.</p>
              )}
              {ruleType === "group" && (
                <p>Defina condições específicas que devem ser atendidas.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : rule ? "Atualizar" : "Criar"} Regra
        </Button>
      </div>
    </form>
  );
}
