"use client";

import type { useState, useEffect } from "react";
import type {
  Plus,
  Search,
  Eye,
  Download,
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Badge } from "@/components/ui/badge";
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
import type { Label } from "@/components/ui/label";
import type { Textarea } from "@/components/ui/textarea";
import type { Separator } from "@/components/ui/separator";
import type { toast } from "sonner";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { useBilling } from "@/hooks/use-billing";
import type { Payment, PaymentFilters, CreatePaymentData } from "@/types/billing";
import type { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/types/billing";

interface PaymentFormData {
  invoice_id: string;
  amount: string;
  payment_method: string;
  payment_date: string;
  reference_number: string;
  notes?: string;
}

export function PaymentsManagement() {
  const {
    loading,
    payments,
    invoices,
    fetchPayments,
    fetchInvoices,
    createPayment,
    updatePayment,
  } = useBilling();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [formData, setFormData] = useState<PaymentFormData>({
    invoice_id: "",
    amount: "",
    payment_method: "cash",
    payment_date: new Date().toISOString().split("T")[0],
    reference_number: "",
    notes: "",
  });

  // Load payments and invoices on component mount
  useEffect(() => {
    fetchPayments(filters);
    if (invoices.length === 0) {
      fetchInvoices({});
    }
  }, [fetchPayments, fetchInvoices, filters, invoices.length]);

  // Filter payments based on search term
  const filteredPayments = payments.filter(
    (payment) =>
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const resetForm = () => {
    setFormData({
      invoice_id: "",
      amount: "",
      payment_method: "cash",
      payment_date: new Date().toISOString().split("T")[0],
      reference_number: "",
      notes: "",
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openViewDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.invoice_id || !formData.amount) {
      toast.error("Fatura e valor são obrigatórios");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    const paymentData: CreatePaymentData = {
      invoice_id: formData.invoice_id,
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method as any,
      payment_date: formData.payment_date,
      reference_number: formData.reference_number || undefined,
      notes: formData.notes || undefined,
    };

    const success = (await createPayment(paymentData)) !== null;

    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleStatusUpdate = async (payment: Payment, status: string) => {
    try {
      await updatePayment(payment.id, { status: status as any });
      toast.success("Status do pagamento atualizado");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status do pagamento");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusOption = PAYMENT_STATUSES.find((s: any) => s.value === status);
    return statusOption?.label || status;
  };

  const getMethodLabel = (method: string) => {
    const methodOption = PAYMENT_METHODS.find((m: any) => m.value === method);
    return methodOption?.label || method;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  // Get outstanding invoices for payment creation
  const outstandingInvoices = invoices.filter((invoice) =>
    ["sent", "viewed", "overdue", "partially_paid"].includes(invoice.status),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Pagamentos</h2>
          <p className="text-muted-foreground">Registre e controle todos os pagamentos recebidos</p>
        </div>

        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pagamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments
                  .filter((p) => p.status === "completed")
                  .reduce((sum, p) => sum + p.amount, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === "completed").length} pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processando</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments
                  .filter((p) => p.status === "processing")
                  .reduce((sum, p) => sum + p.amount, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === "processing").length} pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falharam</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter((p) => p.status === "failed").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(
                payments.filter((p) => p.status === "failed").reduce((sum, p) => sum + p.amount, 0),
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.length > 0
                ? Math.round(
                    (payments.filter((p) => p.status === "completed").length / payments.length) *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">nos últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pagamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.status?.[0] || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value === "all" ? undefined : [value as any],
                  }))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {PAYMENT_STATUSES.map((status: any) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.payment_method?.[0] || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    payment_method: value === "all" ? undefined : [value as any],
                  }))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os métodos</SelectItem>
                  {PAYMENT_METHODS.map((method: any) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum pagamento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Tente ajustar os filtros de busca"
                  : "Comece registrando seu primeiro pagamento"}
              </p>
              {!searchTerm && (
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeiro Pagamento
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referência</TableHead>
                  <TableHead>Fatura</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.reference_number || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>{payment.invoice_id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{getMethodLabel(payment.payment_method)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(payment.payment_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusLabel(payment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openViewDialog(payment)}>
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Simulate download receipt
                            toast.success("Comprovante baixado");
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <Select
                          value={payment.status}
                          onValueChange={(value) => handleStatusUpdate(payment, value)}
                        >
                          <SelectTrigger className="w-auto h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_STATUSES.map((status: any) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Payment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>Registre um novo pagamento recebido de uma fatura</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_id">Fatura *</Label>
                <Select
                  value={formData.invoice_id}
                  onValueChange={(value) => {
                    const invoice = invoices.find((inv) => inv.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      invoice_id: value,
                      amount: invoice ? invoice.total_amount.toString() : "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar fatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {outstandingInvoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        #{invoice.invoice_number} - {formatCurrency(invoice.total_amount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Método de Pagamento *</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, payment_method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method: any) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_date">Data do Pagamento *</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, payment_date: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Número de Referência</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reference_number: e.target.value }))
                }
                placeholder="ID da transação, número do cheque, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre o pagamento..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                Registrar Pagamento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Pagamento #{selectedPayment?.reference_number || selectedPayment?.id}
            </DialogTitle>
            <DialogDescription>Detalhes completos do pagamento</DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge className={`mt-1 ${getStatusColor(selectedPayment.status)}`}>
                    {getStatusLabel(selectedPayment.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Valor</Label>
                  <div className="text-lg font-bold">{formatCurrency(selectedPayment.amount)}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Método</Label>
                  <div>{getMethodLabel(selectedPayment.payment_method)}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Data do Pagamento</Label>
                  <div>{formatDate(selectedPayment.payment_date)}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Fatura</Label>
                  <div className="font-medium">{selectedPayment.invoice_id}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Referência</Label>
                  <div>{selectedPayment.reference_number || "N/A"}</div>
                </div>
              </div>

              {selectedPayment.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-base font-medium mb-2 block">Observações</Label>
                    <p className="text-sm text-muted-foreground">{selectedPayment.notes}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Simulate download receipt
                    toast.success("Comprovante baixado");
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Comprovante
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
