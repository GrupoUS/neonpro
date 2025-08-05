"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Upload, 
  Database, 
  Shield,
  Calendar,
  FileText,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  HardDrive
} from "lucide-react";
import { toast } from "sonner";

const backupExportSchema = z.object({
  // Automatic Backup Settings
  automaticBackup: z.object({
    enabled: z.boolean(),
    frequency: z.enum(["daily", "weekly", "monthly"]),
    time: z.string(),
    retentionDays: z.number().min(7).max(365),
    includeFiles: z.boolean(),
    includeDatabase: z.boolean(),
    encryption: z.boolean(),
  }),
  
  // Export Settings
  exportSettings: z.object({
    defaultFormat: z.enum(["json", "csv", "xml", "pdf"]),
    includePII: z.boolean(),
    anonymizeData: z.boolean(),
    dateRange: z.enum(["all", "last_year", "last_6_months", "custom"]),
    customStartDate: z.string().optional(),
    customEndDate: z.string().optional(),
  }),
  
  // LGPD Compliance
  lgpdCompliance: z.object({
    automaticAnonymization: z.boolean(),
    anonymizationDays: z.number().min(30).max(2555),
    dataPortabilityEnabled: z.boolean(),
    rightToErasure: z.boolean(),
    consentWithdrawalDeletion: z.boolean(),
  }),
  
  // Storage Settings
  storage: z.object({
    localPath: z.string().optional(),
    cloudProvider: z.enum(["none", "aws", "google", "azure"]).optional(),
    cloudBucket: z.string().optional(),
    cloudRegion: z.string().optional(),
    encryptionKey: z.string().optional(),
  }),
});

type BackupExportFormData = z.infer<typeof backupExportSchema>;

interface BackupHistory {
  id: string;
  date: Date;
  type: "automatic" | "manual";
  status: "success" | "failed" | "in_progress";
  size: number;
  duration: number;
  location: string;
}

export default function BackupExport() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  const form = useForm<BackupExportFormData>({
    resolver: zodResolver(backupExportSchema),
    defaultValues: {
      automaticBackup: {
        enabled: true,
        frequency: "daily",
        time: "02:00",
        retentionDays: 30,
        includeFiles: true,
        includeDatabase: true,
        encryption: true,
      },
      exportSettings: {
        defaultFormat: "json",
        includePII: false,
        anonymizeData: true,
        dateRange: "last_year",
        customStartDate: "",
        customEndDate: "",
      },
      lgpdCompliance: {
        automaticAnonymization: true,
        anonymizationDays: 365,
        dataPortabilityEnabled: true,
        rightToErasure: true,
        consentWithdrawalDeletion: true,
      },
      storage: {
        localPath: "/backups",
        cloudProvider: "none",
        cloudBucket: "",
        cloudRegion: "us-east-1",
        encryptionKey: "",
      },
    },
  });

  // Load existing settings and backup history
  useEffect(() => {
    const loadBackupSettings = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // Mock backup history
        setBackupHistory([
          {
            id: "1",
            date: new Date(Date.now() - 86400000), // 1 day ago
            type: "automatic",
            status: "success",
            size: 150000000, // 150MB
            duration: 120, // 2 minutes
            location: "/backups/backup_2024_01_20.tar.gz",
          },
          {
            id: "2",
            date: new Date(Date.now() - 172800000), // 2 days ago
            type: "automatic",
            status: "success",
            size: 148000000,
            duration: 115,
            location: "/backups/backup_2024_01_19.tar.gz",
          },
        ]);
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast.error("Erro ao carregar configurações de backup");
      } finally {
        setIsLoading(false);
      }
    };

    loadBackupSettings();
  }, [form]);

  const onSubmit = async (data: BackupExportFormData) => {
    setIsSaving(true);
    try {
      setLastSaved(new Date());
      toast.success("Configurações de backup salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const startManualBackup = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      
      // Simulate backup progress
      const interval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsExporting(false);
            toast.success("Backup manual realizado com sucesso!");
            return 100;
          }
          return prev + 10;
        });
      }, 500);
      
    } catch (error) {
      console.error("Erro no backup:", error);
      toast.error("Erro ao realizar backup");
      setIsExporting(false);
    }
  };

  const exportPatientData = async (patientId?: string) => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      
      // Simulate export progress
      const interval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsExporting(false);
            toast.success("Dados exportados com sucesso!");
            return 100;
          }
          return prev + 15;
        });
      }, 300);
      
    } catch (error) {
      console.error("Erro na exportação:", error);
      toast.error("Erro ao exportar dados");
      setIsExporting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Conformidade LGPD:</strong> Este módulo garante a conformidade com os direitos 
          dos titulares de dados, incluindo portabilidade, anonimização e direito ao esquecimento.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Automatic Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup Automático
              </CardTitle>
              <CardDescription>
                Configure backups automáticos para proteção dos dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="automaticBackup.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Habilitar Backup Automático</FormLabel>
                      <FormDescription>
                        Realizar backups automáticos dos dados
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("automaticBackup.enabled") && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="automaticBackup.frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequência</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Diário</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="automaticBackup.time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormDescription>Horário para executar o backup</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="automaticBackup.retentionDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retenção (dias)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="7"
                              max="365"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            />
                          </FormControl>
                          <FormDescription>Dias para manter backups</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="automaticBackup.includeDatabase"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Incluir Banco de Dados</FormLabel>
                            <FormDescription>Backup completo do banco</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="automaticBackup.includeFiles"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Incluir Arquivos</FormLabel>
                            <FormDescription>Backup de documentos e imagens</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="automaticBackup.encryption"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Criptografia</FormLabel>
                            <FormDescription>Criptografar backups</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Manual Backup and Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Backup Manual e Exportação
              </CardTitle>
              <CardDescription>
                Realizar backups sob demanda e exportações LGPD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  onClick={startManualBackup}
                  disabled={isExporting}
                  className="flex-1"
                >
                  <Database className="h-4 w-4 mr-2" />
                  {isExporting ? "Realizando Backup..." : "Backup Manual"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => exportPatientData()}
                  disabled={isExporting}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar Dados (LGPD)
                </Button>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso do Backup/Exportação</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              )}

              <FormField
                control={form.control}
                name="exportSettings.defaultFormat"
                render={({ field }) => (
                  <FormItem className="md:w-1/2">
                    <FormLabel>Formato Padrão de Exportação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Formato para exportações de dados dos pacientes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* LGPD Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Conformidade LGPD
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  CRÍTICO
                </Badge>
              </CardTitle>
              <CardDescription>
                Configurações obrigatórias para conformidade com a LGPD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="lgpdCompliance.dataPortabilityEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Portabilidade de Dados
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormDescription>
                        Permitir exportação de dados pelos pacientes (Art. 18, V LGPD)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lgpdCompliance.rightToErasure"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Direito ao Esquecimento
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormDescription>
                        Permitir eliminação de dados pelos pacientes (Art. 18, VI LGPD)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lgpdCompliance.automaticAnonymization"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Anonimização Automática</FormLabel>
                      <FormDescription>
                        Anonimizar dados após período de retenção
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("lgpdCompliance.automaticAnonymization") && (
                <FormField
                  control={form.control}
                  name="lgpdCompliance.anonymizationDays"
                  render={({ field }) => (
                    <FormItem className="md:w-1/3">
                      <FormLabel>Dias para Anonimização</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="30"
                          max="2555"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 365)}
                        />
                      </FormControl>
                      <FormDescription>
                        Dias após inatividade para anonimizar dados
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Backup History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Backups
              </CardTitle>
              <CardDescription>
                Últimos backups realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backupHistory.length === 0 ? (
                <div className="text-center p-8">
                  <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum backup encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Realize o primeiro backup da clínica
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backupHistory.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          backup.status === "success" ? "bg-green-100" :
                          backup.status === "failed" ? "bg-red-100" : "bg-yellow-100"
                        }`}>
                          {backup.status === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : backup.status === "failed" ? (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            Backup {backup.type === "automatic" ? "Automático" : "Manual"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {backup.date.toLocaleString("pt-BR")} • {formatBytes(backup.size)} • {formatDuration(backup.duration)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            backup.status === "success" ? "bg-green-100 text-green-800" :
                            backup.status === "failed" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {backup.status === "success" ? "Sucesso" :
                           backup.status === "failed" ? "Falhou" : "Em andamento"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {lastSaved && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Salvo em {lastSaved.toLocaleTimeString()}
                </>
              )}
            </div>
            <Button type="submit" disabled={isSaving} className="min-w-32">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
