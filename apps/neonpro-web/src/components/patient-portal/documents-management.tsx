"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Download,
  FileText,
  Image,
  Upload,
  X,
  Eye,
  Lock,
  Shield,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  name: string;
  type: "exam" | "prescription" | "report" | "consent" | "other";
  size: string;
  uploadDate: string;
  status: "processed" | "pending" | "error";
  isConfidential: boolean;
  lgpdConsent: boolean;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Exame_Laboratorial_15_07_2024.pdf",
    type: "exam",
    size: "2.3 MB",
    uploadDate: "2024-07-15",
    status: "processed",
    isConfidential: true,
    lgpdConsent: true,
  },
  {
    id: "2",
    name: "Receita_Medicamentos_10_07_2024.pdf",
    type: "prescription",
    size: "856 KB",
    uploadDate: "2024-07-10",
    status: "processed",
    isConfidential: true,
    lgpdConsent: true,
  },
  {
    id: "3",
    name: "Termo_Consentimento_Botox.pdf",
    type: "consent",
    size: "1.2 MB",
    uploadDate: "2024-07-05",
    status: "processed",
    isConfidential: false,
    lgpdConsent: true,
  },
];

const documentTypeLabels = {
  exam: "Exame",
  prescription: "Receita",
  report: "Relatório",
  consent: "Consentimento",
  other: "Outros",
};

const statusLabels = {
  processed: "Processado",
  pending: "Processando",
  error: "Erro",
};

export function DocumentsManagement() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showLgpdDialog, setShowLgpdDialog] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocuments = documents.filter(
    (doc) => selectedType === "all" || doc.type === selectedType,
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!lgpdConsent) {
      setShowLgpdDialog(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsUploading(false);
          // Add new document to list
          const file = files[0];
          const newDoc: Document = {
            id: Date.now().toString(),
            name: file.name,
            type: "other",
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            uploadDate: new Date().toISOString().split("T")[0],
            status: "pending",
            isConfidential: true,
            lgpdConsent: true,
          };
          setDocuments((prev) => [newDoc, ...prev]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDownload = (doc: Document) => {
    // Simulate document download
    console.log(`Downloading ${doc.name}`);
  };

  const handleDelete = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "exam":
      case "report":
        return FileText;
      case "prescription":
        return FileText;
      case "consent":
        return Shield;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* LGPD Consent Dialog */}
      <Dialog open={showLgpdDialog} onOpenChange={setShowLgpdDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Consentimento LGPD
            </DialogTitle>
            <DialogDescription>
              Para fazer upload de documentos médicos, é necessário seu consentimento para
              processamento de dados pessoais.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Seus documentos serão criptografados e armazenados com segurança máxima, conforme
                LGPD e normas do CFM.
              </AlertDescription>
            </Alert>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                checked={lgpdConsent}
                onCheckedChange={(checked) => setLgpdConsent(checked as boolean)}
              />
              <Label htmlFor="consent" className="text-sm">
                Consinto com o processamento dos meus dados médicos para fins de tratamento e
                acompanhamento clínico.
              </Label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowLgpdDialog(false);
                  if (lgpdConsent && fileInputRef.current?.files) {
                    handleFileUpload({ target: fileInputRef.current } as any);
                  }
                }}
                disabled={!lgpdConsent}
                className="flex-1"
              >
                Confirmar e Continuar
              </Button>
              <Button variant="outline" onClick={() => setShowLgpdDialog(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meus Documentos</h2>
          <p className="text-gray-600">Gerencie seus documentos médicos com segurança</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="exam">Exames</SelectItem>
              <SelectItem value="prescription">Receitas</SelectItem>
              <SelectItem value="report">Relatórios</SelectItem>
              <SelectItem value="consent">Consentimentos</SelectItem>
              <SelectItem value="other">Outros</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary hover:bg-primary/90"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Documento
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Fazendo upload do documento...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* LGPD Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Segurança LGPD:</strong> Todos os documentos são criptografados e processados
          conforme regulamentações de proteção de dados pessoais e normas do CFM.
        </AlertDescription>
      </Alert>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos ({filteredDocuments.length})</CardTitle>
          <CardDescription>Lista dos seus documentos médicos organizados por data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhum documento encontrado</p>
                <p className="text-sm text-gray-400">
                  {selectedType === "all"
                    ? "Faça upload do seu primeiro documento"
                    : "Nenhum documento encontrado para este filtro"}
                </p>
              </div>
            ) : (
              filteredDocuments.map((doc, index) => {
                const IconComponent = getDocumentIcon(doc.type);
                return (
                  <div key={doc.id}>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            {doc.isConfidential && <Lock className="h-4 w-4 text-gray-500" />}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              {documentTypeLabels[doc.type as keyof typeof documentTypeLabels]}
                            </span>
                            <span>{doc.size}</span>
                            <span>{new Date(doc.uploadDate).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(doc.status)}>
                          {statusLabels[doc.status as keyof typeof statusLabels]}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(doc)}
                            disabled={doc.status !== "processed"}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(doc)}
                            disabled={doc.status !== "processed"}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < filteredDocuments.length - 1 && <Separator className="my-2" />}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Storage Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Uso do Armazenamento</h3>
              <span className="text-sm text-gray-500">2.8 GB / 10 GB</span>
            </div>
            <Progress value={28} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-primary">8</p>
                <p className="text-gray-500">Exames</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-600">5</p>
                <p className="text-gray-500">Receitas</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-blue-600">3</p>
                <p className="text-gray-500">Relatórios</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-purple-600">2</p>
                <p className="text-gray-500">Consentimentos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
