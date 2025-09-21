import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface ExportJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress: {
    processed: number;
    total: number;
    percentage: number;
  };
  result?: {
    downloadUrl: string;
    filename: string;
    size: number;
    recordCount: number;
    expiresAt: string;
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface ExportButtonProps {
  patientIds?: string[];
  filters?: {
    search?: string;
    status?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  onExportComplete?: (job: ExportJob) => void;
  className?: string;
}

const EXPORT_FORMATS = [
  {
    value: "csv",
    label: "CSV",
    icon: FileText,
    description: "Valores separados por vírgula",
  },
  {
    value: "xlsx",
    label: "Excel",
    icon: FileSpreadsheet,
    description: "Formato Excel nativo",
  },
];

const LGPD_OPTIONS = [
  { id: "anonymize", label: "Anonimizar dados sensíveis", default: true },
  { id: "consent", label: "Exigir consentimento do paciente", default: true },
  {
    id: "excludeRestricted",
    label: "Excluir campos restritos",
    default: false,
  },
];

export function ExportButton({
  patientIds,
  filters,
  onExportComplete,
  className,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"csv" | "xlsx">("csv");
  const [_selectedFields, _setSelectedFields] = useState<string[]>([]);
  const [lgpdOptions, setLgpdOptions] = useState({
    anonymize: true,
    consent: true,
    excludeRestricted: false,
  });
  const [currentJob, setCurrentJob] = useState<ExportJob | null>(null);
  const [_exportHistory, _setExportHistory] = useState<ExportJob[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExport = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/patients/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          format: selectedFormat,
          filters: filters || {},
          pagination: {
            page: 1,
            limit: patientIds?.length || 1000,
          },
          lgpdOptions: {
            anonymizeSensitiveFields: lgpdOptions.anonymize,
            excludeRestrictedFields: lgpdOptions.excludeRestricted,
            purpose: "DATA_EXPORT",
            retentionDays: 30,
            consentRequired: lgpdOptions.consent,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erro ao iniciar exportação");
      }

      const job = result.data;
      setCurrentJob(job);
      toast.success("Exportação iniciada com sucesso");

      pollJobStatus(job.id);
    } catch (_error) {
      console.error("Erro ao iniciar exportação:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao iniciar exportação",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const pollInterval = setInterval(_async () => {
      try {
        const response = await fetch(`/api/patients/export/${jobId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const result = await response.json();

        if (result.success) {
          const job = result.data;
          setCurrentJob(job);

          if (job.status === "completed") {
            clearInterval(pollInterval);
            onExportComplete?.(job);
            toast.success("Exportação concluída com sucesso!");
          } else if (job.status === "failed") {
            clearInterval(pollInterval);
            toast.error(`Exportação falhou: ${job.error}`);
          }
        }
      } catch (_error) {
        console.error("Erro ao verificar status da exportação:", error);
        clearInterval(pollInterval);
      }
    }, 2000);
  };

  const downloadFile = async (job: ExportJob) => {
    if (!job.result) return;

    try {
      const response = await fetch(job.result.downloadUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = job.result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Download iniciado");
      }
    } catch (_error) {
      console.error("Erro ao baixar arquivo:", error);
      toast.error("Erro ao baixar arquivo");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (_<div className={className}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Exportar
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 z-50 w-96 mt-2">
          <CardHeader>
            <CardTitle className="text-lg">Exportar Pacientes</CardTitle>
            <CardDescription>
              Exporte dados dos pacientes em formato CSV ou Excel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentJob ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentJob.status)}
                  <span className="font-medium capitalize">
                    {currentJob.status === "processing"
                      ? "Processando"
                      : currentJob.status === "completed"
                        ? "Concluído"
                        : currentJob.status === "failed"
                          ? "Falhou"
                          : currentJob.status === "cancelled"
                            ? "Cancelado"
                            : "Pendente"}
                  </span>
                </div>

                {currentJob.status === "processing" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{currentJob.progress.percentage}%</span>
                    </div>
                    <Progress value={currentJob.progress.percentage} />
                    <div className="text-xs text-gray-500">
                      {currentJob.progress.processed} de{" "}
                      {currentJob.progress.total} registros
                    </div>
                  </div>
                )}

                {currentJob.status === "completed" && currentJob.result && (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div className="font-medium">
                        Arquivo pronto para download
                      </div>
                      <div className="text-gray-500">
                        {currentJob.result.recordCount} registros •{" "}
                        {formatFileSize(currentJob.result.size)}
                      </div>
                    </div>
                    <Button
                      onClick={() => downloadFile(currentJob)}
                      className="w-full"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Arquivo
                    </Button>
                  </div>
                )}

                {currentJob.error && (
                  <Alert>
                    <AlertDescription className="text-red-600">
                      {currentJob.error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="format">Formato</Label>
                  <Select
                    value={selectedFormat}
                    onValueChange={(value: "csv" | "xlsx") =>
                      setSelectedFormat(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPORT_FORMATS.map(_(format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div className="flex items-center gap-2">
                            <format.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{format.label}</div>
                              <div className="text-xs text-gray-500">
                                {format.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <Label>Opções LGPD</Label>
                  <div className="space-y-2 mt-2">
                    {LGPD_OPTIONS.map(_(option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={option.id}
                          checked={
                            lgpdOptions[option.id as keyof typeof lgpdOptions]
                          }
                          onCheckedChange={(checked: boolean) =>
                            setLgpdOptions(_(prev) => ({
                              ...prev,
                              [option.id]: !!checked,
                            }))
                          }
                        />
                        <Label htmlFor={option.id} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    A exportação será processada em segundo plano. Você será
                    notificado quando estiver pronta. Os dados sensíveis serão
                    anonimizados conforme a LGPD.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    onClick={handleExport}
                    disabled={isSubmitting}
                    className="flex-1"
                    size="sm"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Iniciar Exportação
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
