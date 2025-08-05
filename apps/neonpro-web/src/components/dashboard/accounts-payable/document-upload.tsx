"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { documentsService } from "@/lib/services/documents";
import type { Download, FileText, Trash2, Upload } from "lucide-react";
import type { useRef, useState } from "react";
import type { toast } from "sonner";

export interface DocumentUploadProps {
  entityType: "vendor" | "payable";
  entityId: string;
  existingDocuments?: any[];
  onDocumentsChange?: () => void;
}

export default function DocumentUpload({
  entityType,
  entityId,
  existingDocuments = [],
  onDocumentsChange,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: "invoice", label: "Fatura/Invoice" },
    { value: "contract", label: "Contrato" },
    { value: "receipt", label: "Recibo" },
    { value: "tax_document", label: "Documento Fiscal" },
    { value: "bank_statement", label: "Extrato Bancário" },
    { value: "payment_proof", label: "Comprovante de Pagamento" },
    { value: "certificate", label: "Certificado" },
    { value: "other", label: "Outro" },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0 || !documentType) {
      toast.error("Selecione arquivos e tipo de documento");
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        await documentsService.uploadDocument({
          file,
          entityType,
          entityId,
          documentType,
          fileName: file.name,
        });
      }

      setFiles([]);
      setDocumentType("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Documentos enviados com sucesso");
      onDocumentsChange?.();
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar documentos");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      await documentsService.downloadDocument(documentId, fileName);
    } catch (error) {
      console.error("Erro no download:", error);
      toast.error("Erro ao baixar documento");
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await documentsService.deleteDocument(documentId);
      toast.success("Documento removido com sucesso");
      onDocumentsChange?.();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao remover documento");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileInput">Arquivos</Label>
              <Input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Arquivos Selecionados:</Label>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || !documentType || uploading}
            className="w-full"
          >
            {uploading ? "Enviando..." : "Enviar Documentos"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos Existentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">
                          {documentTypes.find((t) => t.value === doc.document_type)?.label ||
                            doc.document_type}
                        </Badge>
                        {doc.file_size && <span>{formatFileSize(doc.file_size)}</span>}
                        <span>{new Date(doc.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.id, doc.file_name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
