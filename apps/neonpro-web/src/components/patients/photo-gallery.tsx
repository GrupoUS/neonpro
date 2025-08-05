"use client";

import React, { useState, useEffect } from "react";
import type { Card, CardContent } from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Download,
  Trash2,
  ZoomIn,
  Search,
  Filter,
  FileImage,
  Calendar,
  MapPin,
  Stethoscope,
  Eye,
  Grid3X3,
  List,
  ArrowUpDown,
  MoreVertical,
  Edit,
} from "lucide-react";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { cn } from "@/lib/utils";
import type {
  getPatientPhotos,
  deletePatientPhoto,
  downloadPatientPhoto,
} from "@/lib/supabase-storage";
import type { PhotoMetadata } from "@/lib/supabase-storage";

interface PatientPhoto {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  metadata: PhotoMetadata;
  created_at: string;
  publicUrl: string;
  patient_id: string;
  lgpd_consented: boolean;
}

interface PhotoGalleryProps {
  patientId: string;
  readonly?: boolean;
  onPhotoDeleted?: (photoId: string) => void;
  onPhotoUpdated?: (photo: PatientPhoto) => void;
  className?: string;
}

type ViewMode = "grid" | "list";
type SortBy = "date_desc" | "date_asc" | "name_asc" | "name_desc" | "size_desc" | "size_asc";

export function PhotoGallery({
  patientId,
  readonly = false,
  onPhotoDeleted,
  onPhotoUpdated,
  className,
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<PatientPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PatientPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PatientPhoto | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [treatmentFilter, setTreatmentFilter] = useState<string>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [patientId, currentPage]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [photos, searchTerm, categoryFilter, treatmentFilter, areaFilter, sortBy]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getPatientPhotos(patientId, {
        page: currentPage,
        limit: 50, // Load more photos for better UX
      });

      if (!result.success) {
        throw new Error(result.error || "Erro ao carregar fotos");
      }

      const newPhotos = result.data || [];

      if (currentPage === 1) {
        setPhotos(newPhotos);
      } else {
        setPhotos((prev) => [...prev, ...newPhotos]);
      }

      if (result.pagination) {
        setTotalPages(result.pagination.totalPages);
        setHasMore(currentPage < result.pagination.totalPages);
      }
    } catch (err) {
      console.error("Erro ao carregar fotos:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar fotos");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...photos];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (photo) =>
          photo.file_name.toLowerCase().includes(term) ||
          photo.metadata.treatmentType.toLowerCase().includes(term) ||
          photo.metadata.anatomicalArea.toLowerCase().includes(term) ||
          photo.metadata.notes.toLowerCase().includes(term),
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((photo) => photo.metadata.category === categoryFilter);
    }

    // Apply treatment filter
    if (treatmentFilter !== "all") {
      filtered = filtered.filter((photo) => photo.metadata.treatmentType === treatmentFilter);
    }

    // Apply area filter
    if (areaFilter !== "all") {
      filtered = filtered.filter((photo) => photo.metadata.anatomicalArea === areaFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name_asc":
          return a.file_name.localeCompare(b.file_name);
        case "name_desc":
          return b.file_name.localeCompare(a.file_name);
        case "size_desc":
          return b.file_size - a.file_size;
        case "size_asc":
          return a.file_size - b.file_size;
        default:
          return 0;
      }
    });

    setFilteredPhotos(filtered);
  };

  const handleDownload = async (photo: PatientPhoto) => {
    try {
      const result = await downloadPatientPhoto(photo.file_path);

      if (!result.success || !result.blob) {
        throw new Error(result.error || "Erro ao baixar foto");
      }

      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro no download:", error);
      setError("Erro ao baixar foto");
    }
  };

  const handleDelete = async (photo: PatientPhoto) => {
    if (!confirm(`Tem certeza que deseja deletar a foto "${photo.file_name}"?`)) {
      return;
    }

    try {
      const result = await deletePatientPhoto(photo.id);

      if (!result.success) {
        throw new Error(result.error || "Erro ao deletar foto");
      }

      // Remove from local state
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));

      if (onPhotoDeleted) {
        onPhotoDeleted(photo.id);
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      setError("Erro ao deletar foto");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "before":
        return "text-blue-600 bg-blue-50";
      case "after":
        return "text-green-600 bg-green-50";
      case "during":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "before":
        return "Antes";
      case "after":
        return "Depois";
      case "during":
        return "Durante";
      default:
        return category;
    }
  };

  // Get unique values for filters
  const uniqueTreatments = [...new Set(photos.map((p) => p.metadata.treatmentType))].filter(
    Boolean,
  );
  const uniqueAreas = [...new Set(photos.map((p) => p.metadata.anatomicalArea))].filter(Boolean);

  if (loading && photos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando fotos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, tratamento, área ou observações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Data (Mais recente)</SelectItem>
              <SelectItem value="date_asc">Data (Mais antiga)</SelectItem>
              <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
              <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
              <SelectItem value="size_desc">Tamanho (Maior)</SelectItem>
              <SelectItem value="size_asc">Tamanho (Menor)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="before">Antes</SelectItem>
                <SelectItem value="during">Durante</SelectItem>
                <SelectItem value="after">Depois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tratamento</Label>
            <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tratamentos</SelectItem>
                {uniqueTreatments.map((treatment) => (
                  <SelectItem key={treatment} value={treatment}>
                    {treatment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Área Anatômica</Label>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                {uniqueAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredPhotos.length} de {photos.length} fotos
          {searchTerm && ` • Busca: "${searchTerm}"`}
        </p>

        {filteredPhotos.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {formatFileSize(filteredPhotos.reduce((sum, photo) => sum + photo.file_size, 0))} total
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Photo Gallery */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12">
          <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">
            {photos.length === 0
              ? "Nenhuma foto encontrada"
              : "Nenhuma foto corresponde aos filtros"}
          </p>
          <p className="text-sm text-muted-foreground">
            {photos.length === 0
              ? "As fotos enviadas aparecerão aqui"
              : "Tente ajustar os filtros de busca"}
          </p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden group">
                  <div className="aspect-square relative">
                    {photo.publicUrl && (
                      <img
                        src={photo.publicUrl}
                        alt={photo.file_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedPhoto(photo)}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleDownload(photo)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {!readonly && (
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(photo)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={getCategoryColor(photo.metadata.category)}>
                        {getCategoryLabel(photo.metadata.category)}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium truncate">{photo.metadata.treatmentType}</p>
                      <p className="text-xs text-muted-foreground">
                        {photo.metadata.anatomicalArea}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(photo.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(photo.file_size)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {filteredPhotos.map((photo) => (
                <Card key={photo.id} className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      {photo.publicUrl && (
                        <img
                          src={photo.publicUrl}
                          alt={photo.file_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{photo.file_name}</p>
                        <Badge className={getCategoryColor(photo.metadata.category)}>
                          {getCategoryLabel(photo.metadata.category)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {photo.metadata.treatmentType}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {photo.metadata.anatomicalArea}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(photo.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>

                      {photo.metadata.notes && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {photo.metadata.notes}
                        </p>
                      )}
                    </div>

                    {/* File Size */}
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(photo.file_size)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedPhoto(photo)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(photo)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {!readonly && (
                        <Button size="sm" variant="outline" onClick={() => handleDelete(photo)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={loading}
              >
                {loading ? "Carregando..." : "Carregar mais fotos"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedPhoto.file_name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPhoto(null)}>
                ✕
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Image */}
                <div className="lg:col-span-2">
                  <div className="max-h-96 flex items-center justify-center">
                    <img
                      src={selectedPhoto.publicUrl}
                      alt={selectedPhoto.file_name}
                      className="max-w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Categoria</Label>
                    <Badge className={getCategoryColor(selectedPhoto.metadata.category)}>
                      {getCategoryLabel(selectedPhoto.metadata.category)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">Tratamento</Label>
                      <p className="text-muted-foreground">
                        {selectedPhoto.metadata.treatmentType}
                      </p>
                    </div>

                    <div>
                      <Label className="font-medium">Área Anatômica</Label>
                      <p className="text-muted-foreground">
                        {selectedPhoto.metadata.anatomicalArea}
                      </p>
                    </div>

                    <div>
                      <Label className="font-medium">Data</Label>
                      <p className="text-muted-foreground">
                        {format(new Date(selectedPhoto.metadata.date), "PPP", { locale: ptBR })}
                      </p>
                    </div>

                    <div>
                      <Label className="font-medium">Upload</Label>
                      <p className="text-muted-foreground">
                        {format(new Date(selectedPhoto.created_at), "PPP 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>

                    <div>
                      <Label className="font-medium">Tamanho</Label>
                      <p className="text-muted-foreground">
                        {formatFileSize(selectedPhoto.file_size)}
                      </p>
                    </div>

                    {selectedPhoto.metadata.notes && (
                      <div>
                        <Label className="font-medium">Observações</Label>
                        <p className="text-muted-foreground">{selectedPhoto.metadata.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(selectedPhoto)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {!readonly && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          handleDelete(selectedPhoto);
                          setSelectedPhoto(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
