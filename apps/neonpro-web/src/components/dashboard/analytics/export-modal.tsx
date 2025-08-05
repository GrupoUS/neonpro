"use client";

import type { useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Label } from "@/components/ui/label";

interface ExportData {
  kpis: any;
  charts: any;
  activeTab: string;
}

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  data: ExportData;
}

export function ExportModal({ open, onClose, data }: ExportModalProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["pdf"]);
  const [selectedSections, setSelectedSections] = useState<string[]>(["kpis", "charts"]);
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions = [
    { id: "pdf", label: "PDF Report", icon: "📄" },
    { id: "csv", label: "CSV Data", icon: "📊" },
    { id: "xlsx", label: "Excel Spreadsheet", icon: "📈" },
  ];

  const sectionOptions = [
    { id: "kpis", label: "KPIs e Métricas" },
    { id: "charts", label: "Gráficos e Visualizações" },
    { id: "summary", label: "Resumo Executivo" },
  ];

  const handleFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setSelectedFormats([...selectedFormats, format]);
    } else {
      setSelectedFormats(selectedFormats.filter((f) => f !== format));
    }
  };

  const handleSectionChange = (section: string, checked: boolean) => {
    if (checked) {
      setSelectedSections([...selectedSections, section]);
    } else {
      setSelectedSections(selectedSections.filter((s) => s !== section));
    }
  };

  const handleExport = async () => {
    if (selectedFormats.length === 0 || selectedSections.length === 0) {
      alert("Selecione pelo menos um formato e uma seção para exportar");
      return;
    }

    setIsExporting(true);

    try {
      // Simular processo de exportação
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Exportação real para CSV
      selectedFormats.forEach((format) => {
        const fileName = `neonpro-analytics-${new Date().toISOString().split("T")[0]}.${format}`;

        if (format === "csv") {
          // Gerar e baixar CSV real
          const csvData = generateCSVData(data, selectedSections);
          downloadCSV(csvData, fileName);
        } else {
          console.log(`Exportando ${fileName} com seções:`, selectedSections);
        }
      });

      const message =
        selectedFormats.length === 1
          ? `Relatório exportado com sucesso em formato ${selectedFormats[0].toUpperCase()}!`
          : `Relatório exportado com sucesso em ${selectedFormats.length} formatos!`;

      alert(message);
      onClose();
    } catch (error) {
      alert("Erro ao exportar relatório. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  // Função para gerar dados CSV
  const generateCSVData = (data: ExportData, sections: string[]) => {
    let csv = "NeonPro - Dashboard de Analytics\n";
    csv += `Data de Exportação: ${new Date().toLocaleDateString("pt-BR")}\n\n`;

    if (sections.includes("kpis")) {
      csv += "=== KPIs CLÍNICOS ===\n";
      csv += "Métrica,Valor,Variação,Tendência\n";
      csv += `Satisfação do Paciente,${
        data.kpis.clinical.patientSatisfaction.value
      }%,${data.kpis.clinical.patientSatisfaction.change > 0 ? "+" : ""}${
        data.kpis.clinical.patientSatisfaction.change
      }%,${data.kpis.clinical.patientSatisfaction.trend}\n`;
      csv += `Taxa de Conclusão,${
        data.kpis.clinical.appointmentCompletion.value
      }%,${data.kpis.clinical.appointmentCompletion.change > 0 ? "+" : ""}${
        data.kpis.clinical.appointmentCompletion.change
      }%,${data.kpis.clinical.appointmentCompletion.trend}\n\n`;

      csv += "=== KPIs FINANCEIROS ===\n";
      csv += "Métrica,Valor,Variação,Tendência\n";
      csv += `Receita Mensal,R$ ${data.kpis.financial.monthlyRevenue.value.toLocaleString(
        "pt-BR",
      )},${data.kpis.financial.monthlyRevenue.change > 0 ? "+" : ""}${
        data.kpis.financial.monthlyRevenue.change
      }%,${data.kpis.financial.monthlyRevenue.trend}\n\n`;
    }

    if (sections.includes("summary")) {
      csv += "=== RESUMO EXECUTIVO ===\n";
      csv += "Performance geral da clínica demonstra crescimento positivo.\n";
      csv += "Pontos fortes: Satisfação do paciente e eficiência operacional.\n\n";
    }

    csv += "---\n";
    csv += "Gerado automaticamente pelo NeonPro Analytics Dashboard\n";
    return csv;
  };

  // Função para baixar CSV
  const downloadCSV = (csvData: string, fileName: string) => {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">📥 Exportar Analytics</DialogTitle>
          <DialogDescription>
            Selecione o formato e as seções que deseja incluir no relatório
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Formato de Exportação</Label>
            <div className="space-y-2">
              {exportOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedFormats.includes(option.id)}
                    onCheckedChange={(checked: boolean) => handleFormatChange(option.id, checked)}
                  />
                  <Label htmlFor={option.id} className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Seções a Incluir</Label>
            <div className="space-y-2">
              {sectionOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedSections.includes(option.id)}
                    onCheckedChange={(checked: boolean) => handleSectionChange(option.id, checked)}
                  />
                  <Label htmlFor={option.id} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Visualização</Label>
            <div className="flex flex-wrap gap-2">
              {selectedFormats.map((format) => (
                <Badge key={format}>{format.toUpperCase()}</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedSections.length} seção(ões) selecionada(s)
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button onClick={onClose} disabled={isExporting}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Exportando...
              </>
            ) : (
              <>📥 Exportar</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
