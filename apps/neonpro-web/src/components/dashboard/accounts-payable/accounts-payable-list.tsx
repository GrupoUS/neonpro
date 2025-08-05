"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent } from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AccountsPayableService } from "@/lib/services/accounts-payable";
import type { ExpenseCategoryService } from "@/lib/services/expense-categories";
import type { VendorService } from "@/lib/services/vendors";
import type { AccountsPayable, AccountsPayableFilters } from "@/lib/types/accounts-payable";
import type { cn } from "@/lib/utils";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";
import type { AccountsPayableForm } from "./accounts-payable-form";

export function AccountsPayableList() {
  const [accountsPayable, setAccountsPayable] = useState<AccountsPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAP, setTotalAP] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [selectedAP, setSelectedAP] = useState<AccountsPayable | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [apToDelete, setApToDelete] = useState<AccountsPayable | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter options
  const [vendors, setVendors] = useState<{ id: string; label: string; value: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string; value: string }[]>([]);

  // Filters
  const [filters, setFilters] = useState<AccountsPayableFilters>({
    search: "",
    vendor_id: undefined,
    status: undefined,
    priority: undefined,
    expense_category_id: undefined,
    due_date_from: undefined,
    due_date_to: undefined,
    overdue_only: false,
  });

  useEffect(() => {
    loadAccountsPayable();
    loadFilterOptions();
  }, [filters, currentPage]);

  const loadAccountsPayable = async () => {
    try {
      setLoading(true);
      const response = await AccountsPayableService.getAccountsPayable(
        filters,
        currentPage,
        pageSize,
      );
      setAccountsPayable(response.accounts_payable);
      setTotalAP(response.total);
    } catch (error: any) {
      console.error("Error loading accounts payable:", error);
      toast.error("Erro ao carregar contas a pagar");
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [vendorsData, categoriesData] = await Promise.all([
        VendorService.getActiveVendorsForSelection(),
        ExpenseCategoryService.getActiveCategoriesForSelection(),
      ]);
      setVendors(vendorsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  };

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof AccountsPayableFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleEdit = (ap: AccountsPayable) => {
    setSelectedAP(ap);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!apToDelete) return;

    setDeleteLoading(true);
    try {
      await AccountsPayableService.deleteAccountsPayable(apToDelete.id, "Deletado pelo usuário");
      toast.success("Conta a pagar deletada com sucesso!");
      loadAccountsPayable();
    } catch (error: any) {
      console.error("Error deleting accounts payable:", error);
      toast.error("Erro ao deletar conta a pagar");
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
      setApToDelete(null);
    }
  };

  const handleStatusUpdate = async (ap: AccountsPayable, newStatus: string) => {
    try {
      await AccountsPayableService.updateStatus(ap.id, newStatus);
      toast.success("Status atualizado com sucesso!");
      loadAccountsPayable();
    } catch (error: any) {
      console.error("Error updating AP status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleFormSuccess = () => {
    loadAccountsPayable();
    setSelectedAP(undefined);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: {
        label: "Rascunho",
        variant: "secondary" as const,
        icon: FileText,
      },
      pending: { label: "Pendente", variant: "default" as const, icon: Clock },
      approved: {
        label: "Aprovado",
        variant: "default" as const,
        icon: CheckCircle,
      },
      scheduled: {
        label: "Agendado",
        variant: "secondary" as const,
        icon: Calendar,
      },
      paid: { label: "Pago", variant: "default" as const, icon: CheckCircle },
      partially_paid: {
        label: "Pago Parcial",
        variant: "secondary" as const,
        icon: Clock,
      },
      overdue: {
        label: "Vencido",
        variant: "destructive" as const,
        icon: AlertTriangle,
      },
      disputed: {
        label: "Disputado",
        variant: "destructive" as const,
        icon: AlertTriangle,
      },
      cancelled: {
        label: "Cancelado",
        variant: "outline" as const,
        icon: Trash2,
      },
      refunded: {
        label: "Reembolsado",
        variant: "outline" as const,
        icon: CheckCircle,
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const Icon = statusInfo.icon;

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { label: "Baixa", variant: "outline" as const },
      normal: { label: "Normal", variant: "secondary" as const },
      high: { label: "Alta", variant: "default" as const },
      urgent: { label: "Urgente", variant: "destructive" as const },
    };

    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || priorityMap.normal;
    return <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>;
  };

  const isOverdue = (dueDate: string, status: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today && ["pending", "approved", "scheduled"].includes(status);
  };

  const totalPages = Math.ceil(totalAP / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contas a Pagar</h2>
          <p className="text-muted-foreground">Gerencie todas as contas a pagar</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta a Pagar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número AP, fatura ou descrição..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.vendor_id || "all"}
                onValueChange={(value) =>
                  handleFilterChange("vendor_id", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.value}>
                      {vendor.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange("status", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority || "all"}
                onValueChange={(value) =>
                  handleFilterChange("priority", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.expense_category_id || "all"}
                onValueChange={(value) =>
                  handleFilterChange("expense_category_id", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número AP / Fatura</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Carregando contas a pagar...
                    </p>
                  </TableCell>
                </TableRow>
              ) : accountsPayable.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {Object.values(filters).some((v) => v !== undefined && v !== "")
                        ? "Nenhuma conta a pagar encontrada com os filtros aplicados"
                        : "Nenhuma conta a pagar cadastrada"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                accountsPayable.map((ap) => (
                  <TableRow key={ap.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ap.ap_number}</div>
                        {ap.invoice_number && (
                          <div className="text-sm text-muted-foreground">
                            Fatura: {ap.invoice_number}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="font-medium">{ap.vendor?.company_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ap.expense_category?.category_name}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div
                        className={cn(
                          "text-sm",
                          isOverdue(ap.due_date, ap.status) && "text-destructive font-medium",
                        )}
                      >
                        {formatDate(ap.due_date)}
                        {isOverdue(ap.due_date, ap.status) && (
                          <div className="flex items-center gap-1 text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            Vencido
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="font-medium">{formatCurrency(ap.balance_amount)}</div>
                        {ap.balance_amount < ap.net_amount && (
                          <div className="text-sm text-muted-foreground">
                            de {formatCurrency(ap.net_amount)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(ap.status)}</TableCell>

                    <TableCell>{getPriorityBadge(ap.priority)}</TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(ap)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>

                          {ap.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(ap, "approved")}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Aprovar
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setApToDelete(ap);
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
            {Math.min(currentPage * pageSize, totalAP)} de {totalAP} contas a pagar
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
                const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
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
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      {/* AP Form Dialog */}
      <AccountsPayableForm
        accountsPayable={selectedAP}
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setSelectedAP(undefined);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja deletar a conta a pagar "{apToDelete?.ap_number}"? Esta ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
