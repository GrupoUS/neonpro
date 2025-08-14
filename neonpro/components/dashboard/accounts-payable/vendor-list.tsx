"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VendorService } from "@/lib/services/vendors";
import { Vendor, VendorFilters } from "@/lib/types/accounts-payable";
import {
  Building,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { VendorForm } from "./vendor-form";

export function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVendors, setTotalVendors] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState<VendorFilters>({
    search: "",
    vendor_type: undefined,
    is_active: undefined,
    payment_method: undefined,
    requires_approval: undefined,
  });

  useEffect(() => {
    loadVendors();
  }, [filters, currentPage]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await VendorService.getVendors(
        filters,
        currentPage,
        pageSize
      );
      setVendors(response.vendors);
      setTotalVendors(response.total);
    } catch (error: any) {
      console.error("Error loading vendors:", error);
      toast.error("Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof VendorFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!vendorToDelete) return;

    setDeleteLoading(true);
    try {
      await VendorService.deleteVendor(
        vendorToDelete.id,
        "Deletado pelo usuário"
      );
      toast.success("Fornecedor deletado com sucesso!");
      loadVendors();
    } catch (error: any) {
      console.error("Error deleting vendor:", error);
      toast.error("Erro ao deletar fornecedor");
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
      setVendorToDelete(null);
    }
  };

  const handleToggleStatus = async (vendor: Vendor) => {
    try {
      await VendorService.toggleVendorStatus(vendor.id, !vendor.is_active);
      toast.success(
        `Fornecedor ${
          !vendor.is_active ? "ativado" : "desativado"
        } com sucesso!`
      );
      loadVendors();
    } catch (error: any) {
      console.error("Error toggling vendor status:", error);
      toast.error("Erro ao alterar status do fornecedor");
    }
  };

  const handleFormSuccess = () => {
    loadVendors();
    setSelectedVendor(undefined);
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return "-";
    return phone;
  };

  const getVendorTypeBadge = (type: string) => {
    const types = {
      supplier: { label: "Fornecedor", variant: "default" as const },
      service_provider: { label: "Prestador", variant: "secondary" as const },
      contractor: { label: "Empreiteiro", variant: "outline" as const },
      consultant: { label: "Consultor", variant: "secondary" as const },
      other: { label: "Outro", variant: "outline" as const },
    };

    const typeInfo = types[type as keyof typeof types] || types.other;
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  const getPaymentMethodBadge = (method: string) => {
    const methods = {
      cash: "Dinheiro",
      check: "Cheque",
      bank_transfer: "Transferência",
      pix: "PIX",
      credit_card: "Cartão",
      other: "Outro",
    };

    return methods[method as keyof typeof methods] || method;
  };

  const totalPages = Math.ceil(totalVendors / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fornecedores</h2>
          <p className="text-muted-foreground">
            Gerencie os fornecedores do sistema
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, código ou contato..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select
              value={filters.vendor_type || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "vendor_type",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="supplier">Fornecedor</SelectItem>
                <SelectItem value="service_provider">Prestador</SelectItem>
                <SelectItem value="contractor">Empreiteiro</SelectItem>
                <SelectItem value="consultant">Consultor</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={
                filters.is_active === undefined
                  ? "all"
                  : filters.is_active.toString()
              }
              onValueChange={(value) =>
                handleFilterChange(
                  "is_active",
                  value === "all" ? undefined : value === "true"
                )
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.payment_method || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "payment_method",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="bank_transfer">Transferência</SelectItem>
                <SelectItem value="check">Cheque</SelectItem>
                <SelectItem value="credit_card">Cartão</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Carregando fornecedores...
                    </p>
                  </TableCell>
                </TableRow>
              ) : vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {filters.search ||
                      filters.vendor_type ||
                      filters.is_active !== undefined
                        ? "Nenhum fornecedor encontrado com os filtros aplicados"
                        : "Nenhum fornecedor cadastrado"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vendor.company_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {vendor.vendor_code}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {vendor.contact_person && (
                          <div className="text-sm">{vendor.contact_person}</div>
                        )}
                        {vendor.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                          </div>
                        )}
                        {vendor.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {formatPhone(vendor.phone)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {getVendorTypeBadge(vendor.vendor_type)}
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {getPaymentMethodBadge(vendor.payment_method)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {vendor.payment_terms_days} dias
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={vendor.is_active ? "default" : "secondary"}
                        >
                          {vendor.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        {vendor.requires_approval && (
                          <Badge variant="outline" className="text-xs">
                            Aprovação
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(vendor)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(vendor)}
                          >
                            {vendor.is_active ? (
                              <ToggleLeft className="mr-2 h-4 w-4" />
                            ) : (
                              <ToggleRight className="mr-2 h-4 w-4" />
                            )}
                            {vendor.is_active ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setVendorToDelete(vendor);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
            {Math.min(currentPage * pageSize, totalVendors)} de {totalVendors}{" "}
            fornecedores
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(
                  1,
                  Math.min(totalPages, currentPage - 2 + i)
                );
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      {/* Vendor Form Dialog */}
      <VendorForm
        vendor={selectedVendor}
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setSelectedVendor(undefined);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja deletar o fornecedor "
              {vendorToDelete?.company_name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
