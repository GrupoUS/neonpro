// Tax Calculator Component
// Story 5.5: Interactive tax calculation tool

"use client";

import type { useState } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Badge } from "@/components/ui/badge";
import type { Separator } from "@/components/ui/separator";
import type {
  Calculator,
  AlertCircle,
  CheckCircle,
  Info,
  DollarSign,
  Percent,
  RefreshCw,
} from "lucide-react";
import type { formatCurrency, formatPercentage } from "@/lib/utils";

interface TaxCalculatorProps {
  clinicId: string;
}

interface TaxCalculation {
  valor_base: number;
  regime_tributario: string;
  tax_breakdown: {
    icms: number;
    iss: number;
    pis: number;
    cofins: number;
    irpj: number;
    csll: number;
    simples_nacional: number;
    inss: number;
    outros: number;
  };
  total_taxes: number;
  valor_liquido: number;
  effective_rate: number;
  calculated_at: string;
  service_code?: string;
  service_type: string;
}

export default function TaxCalculator({ clinicId }: TaxCalculatorProps) {
  const [formData, setFormData] = useState({
    valor_base: "",
    tipo_servico: "",
    codigo_servico: "",
    regime_tributario: "",
  });
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceTypes = [
    "Consulta Médica",
    "Exame Laboratorial",
    "Procedimento Cirúrgico",
    "Fisioterapia",
    "Psicologia",
    "Nutrição",
    "Outros",
  ];

  const taxRegimes = [
    { value: "simples_nacional", label: "Simples Nacional" },
    { value: "lucro_presumido", label: "Lucro Presumido" },
    { value: "lucro_real", label: "Lucro Real" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const calculateTaxes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      const valorBase = parseFloat(formData.valor_base);
      if (isNaN(valorBase) || valorBase <= 0) {
        throw new Error("Valor base deve ser um número positivo");
      }

      if (!formData.tipo_servico) {
        throw new Error("Tipo de serviço é obrigatório");
      }

      const requestData = {
        clinic_id: clinicId,
        valor_base: valorBase,
        tipo_servico: formData.tipo_servico,
        codigo_servico: formData.codigo_servico || undefined,
        regime_tributario: formData.regime_tributario || undefined,
      };

      const response = await fetch("/api/tax/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro no cálculo");
      }

      const data = await response.json();
      setCalculation(data.data);
    } catch (err) {
      console.error("Error calculating taxes:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateTaxes();
  };

  const resetForm = () => {
    setFormData({
      valor_base: "",
      tipo_servico: "",
      codigo_servico: "",
      regime_tributario: "",
    });
    setCalculation(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Calculadora de Impostos</span>
          </CardTitle>
          <CardDescription>
            Calcule os impostos para serviços de saúde de acordo com a legislação brasileira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_base">Valor Base (R$)</Label>
                <Input
                  id="valor_base"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.valor_base}
                  onChange={(e) => handleInputChange("valor_base", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_servico">Tipo de Serviço</Label>
                <Select onValueChange={(value) => handleInputChange("tipo_servico", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo_servico">Código do Serviço (opcional)</Label>
                <Input
                  id="codigo_servico"
                  placeholder="Ex: 04.01"
                  value={formData.codigo_servico}
                  onChange={(e) => handleInputChange("codigo_servico", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regime_tributario">Regime Tributário (opcional)</Label>
                <Select onValueChange={(value) => handleInputChange("regime_tributario", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Usar configuração da clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxRegimes.map((regime) => (
                      <SelectItem key={regime.value} value={regime.value}>
                        {regime.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calcular Impostos
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Resultado do Cálculo</span>
            </CardTitle>
            <CardDescription>
              Calculado em {new Date(calculation.calculated_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Valor Base</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(calculation.valor_base)}</p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Percent className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Total Impostos</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(calculation.total_taxes)}</p>
                <p className="text-sm text-red-600">
                  {formatPercentage(calculation.effective_rate)} do valor base
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Valor Líquido</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(calculation.valor_liquido)}</p>
              </div>
            </div>

            <Separator />

            {/* Tax Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Detalhamento dos Impostos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(calculation.tax_breakdown)
                  .filter(([_, value]) => value > 0)
                  .map(([tax, value]) => (
                    <div key={tax} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium uppercase">
                          {tax.replace("_", " ")}
                        </span>
                        <Badge variant="secondary">
                          {formatPercentage((value / calculation.valor_base) * 100)}
                        </Badge>
                      </div>
                      <p className="text-lg font-semibold">{formatCurrency(value)}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Informações Adicionais</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • Regime tributário:{" "}
                      {calculation.regime_tributario.replace("_", " ").toUpperCase()}
                    </li>
                    <li>• Tipo de serviço: {calculation.service_type}</li>
                    {calculation.service_code && (
                      <li>• Código do serviço: {calculation.service_code}</li>
                    )}
                    <li>
                      • Carga tributária efetiva: {formatPercentage(calculation.effective_rate)}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
