/**
 * Brazilian Tax Demo Component
 * Demonstrates the Brazilian tax system integration for Story 5.5
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useBrazilianTax } from "@/hooks/brazilian-tax/use-brazilian-tax";
import { formatCNPJ } from "@/lib/services/brazilian-tax/cnpj-validator";
import {
  AlertTriangle,
  Building2,
  Calculator,
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function BrazilianTaxDemo() {
  const {
    cnpj,
    tax,
    compliance,
    isInitialized,
    validateAndCalculate,
    resetAll,
  } = useBrazilianTax();

  const [formData, setFormData] = useState({
    cnpj: "",
    serviceType: "aesthetic_treatment",
    serviceValue: 1000,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    setFormData((prev) => ({ ...prev, cnpj: formatted }));
    cnpj.validateCNPJ(formatted);
  };

  const handleConsultCNPJ = async () => {
    if (!cnpj.isValid) return;

    await cnpj.consultCNPJ(formData.cnpj);
  };

  const handleFullValidation = async () => {
    if (!cnpj.isValid || !formData.serviceValue) return;

    setIsProcessing(true);
    try {
      await validateAndCalculate(
        formData.cnpj,
        formData.serviceType,
        formData.serviceValue
      );
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFormData({
      cnpj: "",
      serviceType: "aesthetic_treatment",
      serviceValue: 1000,
    });
    resetAll();
  };

  const serviceTypes = [
    { value: "aesthetic_treatment", label: "Tratamento Estético" },
    { value: "medical_consultation", label: "Consulta Médica" },
    { value: "dental_services", label: "Serviços Odontológicos" },
    { value: "physical_therapy", label: "Fisioterapia" },
    { value: "nutrition_consultation", label: "Consulta Nutricional" },
    { value: "psychology_consultation", label: "Consulta Psicológica" },
    { value: "cosmetic_procedures", label: "Procedimentos Cosméticos" },
    { value: "wellness_services", label: "Serviços de Bem-estar" },
  ];

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Inicializando sistema fiscal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema Fiscal Brasileiro</h1>
          <p className="text-muted-foreground">
            Demonstração da integração com validação de CNPJ, consulta de
            empresas e cálculo de impostos
          </p>
        </div>
        <Button onClick={handleReset} variant="outline">
          Limpar Tudo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>
              Insira o CNPJ da clínica e informações do serviço
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => handleCNPJChange(e.target.value)}
                maxLength={18}
              />
              {cnpj.cnpj && (
                <div className="flex items-center gap-2 text-sm">
                  {cnpj.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={cnpj.isValid ? "text-green-600" : "text-red-600"}
                  >
                    {cnpj.isValid ? "CNPJ válido" : "CNPJ inválido"}
                  </span>
                </div>
              )}
              {cnpj.errors.length > 0 && (
                <div className="text-sm text-red-600">
                  {cnpj.errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Tipo de Serviço</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, serviceType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceValue">Valor do Serviço (R$)</Label>
              <Input
                id="serviceValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.serviceValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    serviceValue: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleConsultCNPJ}
                disabled={!cnpj.isValid || cnpj.isLoading}
                variant="outline"
                className="flex-1"
              >
                {cnpj.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Consultar CNPJ
              </Button>

              <Button
                onClick={handleFullValidation}
                disabled={
                  !cnpj.isValid || !formData.serviceValue || isProcessing
                }
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Calculator className="h-4 w-4 mr-2" />
                )}
                Calcular Impostos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {/* Company Information */}
          {cnpj.companyData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Razão Social</Label>
                  <p className="text-sm">{cnpj.companyData.razao_social}</p>
                </div>

                {cnpj.companyData.nome_fantasia && (
                  <div>
                    <Label className="text-sm font-medium">Nome Fantasia</Label>
                    <p className="text-sm">{cnpj.companyData.nome_fantasia}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">
                    Atividade Principal
                  </Label>
                  <p className="text-sm">
                    {cnpj.companyData.atividade_principal.code} -{" "}
                    {cnpj.companyData.atividade_principal.text}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Situação</Label>
                  <Badge
                    variant={
                      cnpj.companyData.situacao.includes("ATIVA")
                        ? "default"
                        : "destructive"
                    }
                  >
                    {cnpj.companyData.situacao}
                  </Badge>
                </div>

                <div>
                  <Label className="text-sm font-medium">Porte</Label>
                  <p className="text-sm">{cnpj.companyData.porte}</p>
                </div>

                {compliance.healthcareCNAEValid !== null && (
                  <div>
                    <Label className="text-sm font-medium">
                      Setor de Saúde/Estética
                    </Label>
                    <div className="flex items-center gap-2">
                      {compliance.healthcareCNAEValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm">
                        {compliance.healthcareCNAEValid
                          ? "Empresa do setor"
                          : "Empresa de outro setor"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tax Calculation Results */}
          {tax.result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cálculo de Impostos</CardTitle>
                <CardDescription>
                  Breakdown detalhado dos impostos sobre o serviço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Valor Base</Label>
                    <p className="text-lg font-semibold">
                      R$ {tax.result.calculation.valor_base.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Total de Impostos
                    </Label>
                    <p className="text-lg font-semibold text-red-600">
                      R$ {tax.result.total_impostos.toFixed(2)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ICMS</span>
                    <span className="text-sm font-medium">
                      R$ {tax.result.breakdown.icms.valor.toFixed(2)}(
                      {(tax.result.breakdown.icms.aliquota * 100).toFixed(2)}%)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">ISS</span>
                    <span className="text-sm font-medium">
                      R$ {tax.result.breakdown.iss.valor.toFixed(2)}(
                      {(tax.result.breakdown.iss.aliquota * 100).toFixed(2)}%)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">PIS</span>
                    <span className="text-sm font-medium">
                      R$ {tax.result.breakdown.pis.valor.toFixed(2)}(
                      {(tax.result.breakdown.pis.aliquota * 100).toFixed(2)}%)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">COFINS</span>
                    <span className="text-sm font-medium">
                      R$ {tax.result.breakdown.cofins.valor.toFixed(2)}(
                      {(tax.result.breakdown.cofins.aliquota * 100).toFixed(2)}
                      %)
                    </span>
                  </div>

                  {tax.result.breakdown.simples_nacional &&
                    tax.result.breakdown.simples_nacional.valor > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Simples Nacional</span>
                        <span className="text-sm font-medium">
                          R${" "}
                          {tax.result.breakdown.simples_nacional.valor.toFixed(
                            2
                          )}
                          (
                          {(
                            tax.result.breakdown.simples_nacional.aliquota * 100
                          ).toFixed(2)}
                          %)
                        </span>
                      </div>
                    )}
                </div>

                <Separator />

                <div className="flex justify-between items-center font-semibold">
                  <span>Alíquota Efetiva</span>
                  <span className="text-red-600">
                    {(tax.result.aliquota_efetiva * 100).toFixed(2)}%
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Método: {tax.result.calculation.calculation_method}</p>
                  <p>
                    Calculado em:{" "}
                    {new Date(
                      tax.result.calculation.calculation_date
                    ).toLocaleString("pt-BR")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Rate Limiting Info */}
      {cnpj.consultationResult?.rate_limit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Informações de Rate Limiting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>
                Consultas restantes:{" "}
                {cnpj.consultationResult.rate_limit.remaining}
              </p>
              <p>
                Reset em:{" "}
                {new Date(
                  cnpj.consultationResult.rate_limit.reset_time
                ).toLocaleString("pt-BR")}
              </p>
              {cnpj.consultationResult.cached && (
                <p>✅ Resultado obtido do cache (não consome limite)</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
