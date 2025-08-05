"use client";

import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertTriangle,
  Archive,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Download,
  Eye,
  File,
  FileAudio,
  FileImage,
  FilePdf,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Filter,
  Grid,
  Image,
  List,
  Lock,
  MoreVertical,
  Plus,
  Scan,
  Search,
  Shield,
  Tag,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Textarea } from "@/components/ui/textarea";

// Types
interface MedicalDocument {
  id: string;
  patientId: string;
  clinicId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  category: string;
  subcategory?: string;
  description?: string;
  tags: string[];
  isBeforeAfter: boolean;
  beforeAfterPairId?: string;
  position?: "before" | "after";
  captureDate?: Date;
  uploadDate: Date;
  uploadedBy: string;
  accessLevel: string;
  isEncrypted: boolean;
  thumbnailUrl?: string;
  downloadUrl: string;
  metadata: Record<string, any>;
  version: number;
  parentDocumentId?: string;
  status: string;
  expiryDate?: Date;
}

interface DocumentUploadProps {
  patientId: string;
  clinicId: string;
  onDocumentUploaded?: (document: MedicalDocument) => void;
  allowedTypes?: string[];
  maxFileSize?: number;
  category?: string;
  isBeforeAfter?: boolean;
}

const DOCUMENT_CATEGORIES = [
  {
    value: "exam_results",
    label: "Resultados de Exames",
    icon: <FileText className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "prescriptions",
    label: "Receitas Médicas",
    icon: <FileText className="w-4 h-4" />,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "reports",
    label: "Relatórios Médicos",
    icon: <FileText className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "images",
    label: "Imagens Médicas",
    icon: <FileImage className="w-4 h-4" />,
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "before_after",
    label: "Antes e Depois",
    icon: <Camera className="w-4 h-4" />,
    color: "bg-pink-100 text-pink-800",
  },
  {
    value: "consent_forms",
    label: "Termos de Consentimento",
    icon: <Shield className="w-4 h-4" />,
    color: "bg-gray-100 text-gray-800",
  },
  {
    value: "insurance",
    label: "Documentos do Convênio",
    icon: <FileText className="w-4 h-4" />,
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    value: "identification",
    label: "Documentos de Identificação",
    icon: <User className="w-4 h-4" />,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "other",
    label: "Outros",
    icon: <File className="w-4 h-4" />,
    color: "bg-gray-100 text-gray-800",
  },
];

const ACCESS_LEVELS = [
  { value: "public", label: "Público", description: "Visível para toda a equipe" },
  { value: "restricted", label: "Restrito", description: "Apenas médicos responsáveis" },
  { value: "private", label: "Privado", description: "Apenas o médico que enviou" },
  { value: "patient", label: "Paciente", description: "Visível para o paciente" },
];

const FILE_TYPES = {
  "image/jpeg": { icon: <FileImage className="w-4 h-4" />, color: "text-green-600" },
  "image/png": { icon: <FileImage className="w-4 h-4" />, color: "text-green-600" },
  "image/gif": { icon: <FileImage className="w-4 h-4" />, color: "text-green-600" },
  "image/webp": { icon: <FileImage className="w-4 h-4" />, color: "text-green-600" },
  "application/pdf": { icon: <FilePdf className="w-4 h-4" />, color: "text-red-600" },
  "application/msword": { icon: <FileText className="w-4 h-4" />, color: "text-blue-600" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: <FileText className="w-4 h-4" />,
    color: "text-blue-600",
  },
  "application/vnd.ms-excel": {
    icon: <FileSpreadsheet className="w-4 h-4" />,
    color: "text-green-600",
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    icon: <FileSpreadsheet className="w-4 h-4" />,
    color: "text-green-600",
  },
  "video/mp4": { icon: <FileVideo className="w-4 h-4" />, color: "text-purple-600" },
  "video/avi": { icon: <FileVideo className="w-4 h-4" />, color: "text-purple-600" },
  "audio/mp3": { icon: <FileAudio className="w-4 h-4" />, color: "text-orange-600" },
  "audio/wav": { icon: <FileAudio className="w-4 h-4" />, color: "text-orange-600" },
  "application/zip": { icon: <Archive className="w-4 h-4" />, color: "text-gray-600" },
  "application/rar": { icon: <Archive className="w-4 h-4" />, color: "text-gray-600" },
};

const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "video/mp4",
  "video/avi",
  "audio/mp3",
  "audio/wav",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function DocumentUpload({
  patientId,
  clinicId,
  onDocumentUploaded,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  maxFileSize = MAX_FILE_SIZE,
  category,
  isBeforeAfter = false,
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragActive, setDragActive] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [newDocumentData, setNewDocumentData] = useState({
    category: category || "",
    subcategory: "",
    description: "",
    tags: [] as string[],
    accessLevel: "restricted",
    captureDate: new Date(),
    isEncrypted: false,
  });
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load documents
  React.useEffect(() => {
    loadDocuments();
  }, [patientId]);

  const loadDocuments = async () => {
    try {
      // Mock data - replace with actual API call
      const mockDocuments: MedicalDocument[] = [
        {
          id: "1",
          patientId,
          clinicId,
          fileName: "exame_sangue_2024.pdf",
          originalName: "Exame de Sangue - Janeiro 2024.pdf",
          fileType: "application/pdf",
          fileSize: 2048576,
          category: "exam_results",
          description: "Exame de sangue completo - hemograma",
          tags: ["hemograma", "sangue", "rotina"],
          isBeforeAfter: false,
          uploadDate: new Date("2024-01-15"),
          uploadedBy: "dr-silva",
          accessLevel: "restricted",
          isEncrypted: true,
          downloadUrl: "/api/documents/1/download",
          metadata: { laboratory: "Lab Central" },
          version: 1,
          status: "active",
        },
        {
          id: "2",
          patientId,
          clinicId,
          fileName: "antes_tratamento.jpg",
          originalName: "Foto Antes do Tratamento.jpg",
          fileType: "image/jpeg",
          fileSize: 1024000,
          category: "before_after",
          description: "Foto antes do início do tratamento",
          tags: ["antes", "tratamento", "facial"],
          isBeforeAfter: true,
          beforeAfterPairId: "pair-1",
          position: "before",
          captureDate: new Date("2024-01-10"),
          uploadDate: new Date("2024-01-10"),
          uploadedBy: "dr-silva",
          accessLevel: "patient",
          isEncrypted: false,
          thumbnailUrl: "/api/documents/2/thumbnail",
          downloadUrl: "/api/documents/2/download",
          metadata: { camera: "Canon EOS", resolution: "4000x3000" },
          version: 1,
          status: "active",
        },
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        alert(`Tipo de arquivo não permitido: ${file.type}`);
        return false;
      }
      if (file.size > maxFileSize) {
        alert(
          `Arquivo muito grande: ${file.name}. Máximo permitido: ${formatFileSize(maxFileSize)}`,
        );
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setUploadingFiles(validFiles);
      setShowUploadDialog(true);
    }
  };

  const uploadFiles = async () => {
    for (const file of uploadingFiles) {
      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        // Simulate upload progress
        const uploadInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const currentProgress = prev[file.name] || 0;
            if (currentProgress >= 100) {
              clearInterval(uploadInterval);
              return prev;
            }
            return { ...prev, [file.name]: currentProgress + 10 };
          });
        }, 200);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const newDocument: MedicalDocument = {
          id: crypto.randomUUID(),
          patientId,
          clinicId,
          fileName: `${Date.now()}_${file.name}`,
          originalName: file.name,
          fileType: file.type,
          fileSize: file.size,
          category: newDocumentData.category,
          subcategory: newDocumentData.subcategory,
          description: newDocumentData.description,
          tags: newDocumentData.tags,
          isBeforeAfter,
          captureDate: newDocumentData.captureDate,
          uploadDate: new Date(),
          uploadedBy: "current-user",
          accessLevel: newDocumentData.accessLevel,
          isEncrypted: newDocumentData.isEncrypted,
          downloadUrl: `/api/documents/${crypto.randomUUID()}/download`,
          metadata: {
            originalSize: file.size,
            uploadedAt: new Date().toISOString(),
          },
          version: 1,
          status: "active",
        };

        setDocuments((prev) => [...prev, newDocument]);
        onDocumentUploaded?.(newDocument);

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      } catch (error) {
        console.error("Erro ao fazer upload:", error);
        setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }));
      }
    }

    // Reset after upload
    setTimeout(() => {
      setUploadingFiles([]);
      setUploadProgress({});
      setShowUploadDialog(false);
      setNewDocumentData({
        category: category || "",
        subcategory: "",
        description: "",
        tags: [],
        accessLevel: "restricted",
        captureDate: new Date(),
        isEncrypted: false,
      });
    }, 1000);
  };

  const addTag = () => {
    if (tagInput.trim() && !newDocumentData.tags.includes(tagInput.trim())) {
      setNewDocumentData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewDocumentData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    return (
      FILE_TYPES[fileType as keyof typeof FILE_TYPES] || {
        icon: <File className="w-4 h-4" />,
        color: "text-gray-600",
      }
    );
  };

  const getCategoryInfo = (categoryValue: string) => {
    return (
      DOCUMENT_CATEGORIES.find((cat) => cat.value === categoryValue) ||
      DOCUMENT_CATEGORIES[DOCUMENT_CATEGORIES.length - 1]
    );
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchTerm === "" ||
      doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentos Médicos</h2>
          <p className="text-gray-600">Gerencie exames, receitas e outros documentos do paciente</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => cameraInputRef.current?.click()}>
            <Camera className="w-4 h-4 mr-2" />
            Câmera
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(",")}
        onChange={handleFileInput}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload de Documentos</DialogTitle>
            <DialogDescription>
              Configure as informações dos documentos antes do upload
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Files to upload */}
            <div className="space-y-2">
              <Label>Arquivos Selecionados</Label>
              <div className="space-y-2">
                {uploadingFiles.map((file, index) => {
                  const fileIcon = getFileIcon(file.type);
                  const progress = uploadProgress[file.name] || 0;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className={fileIcon.color}>{fileIcon.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                        {progress > 0 && <Progress value={progress} className="mt-1" />}
                      </div>
                      {progress === -1 && <AlertTriangle className="w-5 h-5 text-red-500" />}
                      {progress === 100 && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={newDocumentData.category}
                  onValueChange={(value) =>
                    setNewDocumentData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          {category.icon}
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessLevel">Nível de Acesso</Label>
                <Select
                  value={newDocumentData.accessLevel}
                  onValueChange={(value) =>
                    setNewDocumentData((prev) => ({ ...prev, accessLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCESS_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-gray-500">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategoria</Label>
              <Input
                id="subcategory"
                value={newDocumentData.subcategory}
                onChange={(e) =>
                  setNewDocumentData((prev) => ({ ...prev, subcategory: e.target.value }))
                }
                placeholder="Subcategoria específica"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newDocumentData.description}
                onChange={(e) =>
                  setNewDocumentData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Descrição do documento"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Adicionar tag"
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {newDocumentData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newDocumentData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="captureDate">Data de Captura</Label>
                <Input
                  id="captureDate"
                  type="date"
                  value={format(newDocumentData.captureDate, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setNewDocumentData((prev) => ({
                      ...prev,
                      captureDate: new Date(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="isEncrypted"
                  checked={newDocumentData.isEncrypted}
                  onChange={(e) =>
                    setNewDocumentData((prev) => ({ ...prev, isEncrypted: e.target.checked }))
                  }
                  className="rounded"
                />
                <Label htmlFor="isEncrypted" className="flex items-center space-x-1">
                  <Lock className="w-4 h-4" />
                  <span>Criptografar arquivo</span>
                </Label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowUploadDialog(false);
                  setUploadingFiles([]);
                  setUploadProgress({});
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={!newDocumentData.category || uploadingFiles.length === 0}
              >
                Fazer Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drag and Drop Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </h3>
            <p className="text-gray-600 mb-4">
              Suporte para imagens, PDFs, documentos do Office e mais
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <File className="w-4 h-4 mr-2" />
                Selecionar Arquivos
              </Button>
              <Button variant="outline" onClick={() => cameraInputRef.current?.click()}>
                <Camera className="w-4 h-4 mr-2" />
                Usar Câmera
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {DOCUMENT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List/Grid */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== "all"
                    ? "Nenhum documento encontrado"
                    : "Nenhum documento enviado"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Faça upload de exames, receitas e outros documentos médicos"}
                </p>
                {!searchTerm && selectedCategory === "all" && (
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Fazer Primeiro Upload
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => {
              const categoryInfo = getCategoryInfo(document.category);
              const fileIcon = getFileIcon(document.fileType);
              return (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className={fileIcon.color}>{fileIcon.icon}</div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 truncate">
                          {document.originalName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatFileSize(document.fileSize)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <Badge className={categoryInfo.color} variant="secondary">
                          {categoryInfo.label}
                        </Badge>
                        {document.isEncrypted && (
                          <Badge variant="outline">
                            <Lock className="w-3 h-3 mr-1" />
                            Criptografado
                          </Badge>
                        )}
                      </div>

                      {document.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {document.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {document.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{document.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        {format(document.uploadDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredDocuments.map((document) => {
                  const categoryInfo = getCategoryInfo(document.category);
                  const fileIcon = getFileIcon(document.fileType);
                  return (
                    <div
                      key={document.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className={fileIcon.color}>{fileIcon.icon}</div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{document.originalName}</h3>
                          <Badge className={categoryInfo.color} variant="secondary">
                            {categoryInfo.label}
                          </Badge>
                          {document.isEncrypted && (
                            <Badge variant="outline">
                              <Lock className="w-3 h-3 mr-1" />
                              Criptografado
                            </Badge>
                          )}
                        </div>

                        {document.description && (
                          <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span>
                            {format(document.uploadDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                          {document.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Tag className="w-3 h-3" />
                              <span>{document.tags.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary */}
      {filteredDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Resumo dos Documentos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredDocuments.length}</div>
                <div className="text-sm text-gray-600">Total de Documentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredDocuments.filter((d) => d.fileType.startsWith("image/")).length}
                </div>
                <div className="text-sm text-gray-600">Imagens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredDocuments.filter((d) => d.fileType === "application/pdf").length}
                </div>
                <div className="text-sm text-gray-600">PDFs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredDocuments.filter((d) => d.isEncrypted).length}
                </div>
                <div className="text-sm text-gray-600">Criptografados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
