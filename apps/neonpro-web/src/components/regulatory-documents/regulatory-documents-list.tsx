"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent } from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { useRegulatoryCategories } from "@/hooks/use-regulatory-categories";
import type { useRegulatoryDocuments } from "@/hooks/use-regulatory-documents";
import type {
  DocumentStatusLabels,
  isDocumentExpired,
  isDocumentExpiring,
} from "@/types/regulatory-documents";
import type { formatDistanceToNow } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { AlertTriangle, Calendar, FileText, Plus, Search } from "lucide-react";
import type { useState } from "react";

interface RegulatoryDocumentsListProps {
  onCreateDocument?: () => void;
  onEditDocument?: (documentId: string) => void;
  onViewDocument?: (documentId: string) => void;
}

export function RegulatoryDocumentsList({
  onCreateDocument,
  onEditDocument,
  onViewDocument,
}: RegulatoryDocumentsListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const { documents, loading, pagination, loadMore, hasMore, deleteDocument } =
    useRegulatoryDocuments({
      search: search || undefined,
      status: (statusFilter as any) || undefined,
      category: categoryFilter || undefined,
      limit: 10,
    });

  const { categories, authorities } = useRegulatoryCategories();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "valid":
        return "default";
      case "expiring":
        return "destructive";
      case "expired":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getDaysUntilExpiration = (expirationDate: string | null) => {
    if (!expirationDate) return null;
    const expiration = new Date(expirationDate);
    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este documento?")) {
      await deleteDocument(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documentação Regulatória</h2>
          <p className="text-muted-foreground">
            Gerencie documentos de compliance e certificações da clínica
          </p>
        </div>
        <Button onClick={onCreateDocument} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tipo, número ou nome do arquivo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="valid">Válido</SelectItem>
                  <SelectItem value="expiring">Expirando</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4">
        {loading && documents.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando documentos...</p>
          </div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {search || statusFilter || categoryFilter
                    ? "Tente alterar os filtros para encontrar documentos."
                    : "Comece adicionando seu primeiro documento regulatório."}
                </p>
                {onCreateDocument && (
                  <Button onClick={onCreateDocument}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Documento
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {documents.map((document) => {
              const daysUntilExpiration = getDaysUntilExpiration(document.expiration_date);
              const isExpiring = isDocumentExpiring(document);
              const isExpired = isDocumentExpired(document);

              return (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{document.document_type}</h3>
                          <Badge variant={getStatusBadgeVariant(document.status)}>
                            {DocumentStatusLabels[document.status]}
                          </Badge>
                          {(isExpiring || isExpired) && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {isExpired ? "Expirado" : `${daysUntilExpiration} dias`}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Autoridade:</span> {document.authority}
                          </div>
                          <div>
                            <span className="font-medium">Categoria:</span>{" "}
                            {document.document_category}
                          </div>
                          {document.document_number && (
                            <div>
                              <span className="font-medium">Número:</span>{" "}
                              {document.document_number}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="font-medium">Emissão:</span>
                            {formatDistanceToNow(new Date(document.issue_date), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </div>
                          {document.expiration_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="font-medium">Validade:</span>
                              {formatDistanceToNow(new Date(document.expiration_date), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </div>
                          )}
                        </div>

                        {document.file_name && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium">Arquivo:</span> {document.file_name}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {onViewDocument && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDocument(document.id)}
                          >
                            Ver
                          </Button>
                        )}
                        {onEditDocument && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditDocument(document.id)}
                            data-testid="edit-document-button"
                          >
                            Editar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
                          data-testid="delete-document-button"
                          className="text-destructive hover:text-destructive"
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button variant="outline" onClick={loadMore} disabled={loading}>
                  {loading ? "Carregando..." : "Carregar mais"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Stats */}
      {documents.length > 0 && pagination && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground text-center">
              Mostrando {documents.length} de {pagination.total} documentos
              {pagination.totalPages > 1 && (
                <span>
                  {" "}
                  • Página {pagination.page} de {pagination.totalPages}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
