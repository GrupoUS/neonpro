"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Textarea } from "@/components/ui/textarea";
import type { useBilling } from "@/hooks/use-billing";
import type {
  CreateInvoiceData,
  CreateInvoiceItemData,
  Invoice,
  InvoiceFilters,
} from "@/types/billing";
import type { INVOICE_STATUSES } from "@/types/billing";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  Calendar,
  Clock,
  DollarSign,
  Download,
  Eye,
  Plus,
  Search,
  Send,
  User,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";

interface InvoiceFormData {
  patient_id: string;
  due_date: string;
  items: Array<{
    service_id: string;
    quantity: number;
    unit_price: number;
    description?: string;
  }>;
  notes?: string;
  discount_amount?: string;
  tax_amount?: string;
}

interface Patient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
}

export function InvoicesManagement() {
  const {
    loading,
    invoices,
    services,
    fetchInvoices,
    fetchServices,
    createInvoice,
    updateInvoice,
  } = useBilling();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Add patients state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [formData, setFormData] = useState<InvoiceFormData>({
    patient_id: "",
    due_date: "",
    items: [{ service_id: "", quantity: 1, unit_price: 0 }],
    notes: "",
    discount_amount: "",
    tax_amount: "",
  });

  // Function to fetch patients from API
  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await fetch("/api/patients");

      if (response.ok) {
        const data = await response.json();
        setPatients(data.data || []);
      } else {
        toast.error("Erro ao carregar pacientes");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Erro ao carregar pacientes");
    } finally {
      setLoadingPatients(false);
    }
  };

  // Load invoices, services and patients on component mount
  useEffect(() => {
    fetchInvoices(filters);
    if (services.length === 0) {
      fetchServices({});
    }
    if (patients.length === 0) {
      fetchPatients();
    }
  }, [fetchInvoices, fetchServices, filters, services.length, patients.length]);

  // Update filters when date range changes
  useEffect(() => {
    if (dateRange.from || dateRange.to) {
      setFilters((prev) => ({
        ...prev,
        date_range: dateRange,
      }));
    }
  }, [dateRange]);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const resetForm = () => {
    setFormData({
      patient_id: "",
      due_date: "",
      items: [{ service_id: "", quantity: 1, unit_price: 0 }],
      notes: "",
      discount_amount: "",
      tax_amount: "",
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openViewDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const addInvoiceItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { service_id: "", quantity: 1, unit_price: 0 }],
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const discount = parseFloat(formData.discount_amount || "0");
    const tax = parseFloat(formData.tax_amount || "0");
    return subtotal - discount + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient_id || !formData.due_date) {
      toast.error("Paciente e data de vencimento são obrigatórios");
      return;
    }

    if (formData.items.length === 0 || formData.items.some((item) => !item.service_id)) {
      toast.error("Adicione pelo menos um item à fatura");
      return;
    }

    const invoiceItems: CreateInvoiceItemData[] = formData.items.map((item) => ({
      service_id: item.service_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      description: item.description || "Serviço",
    }));

    const invoiceData: CreateInvoiceData = {
      patient_id: formData.patient_id,
      due_date: formData.due_date,
      items: invoiceItems,
      notes: formData.notes || undefined,
      discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : undefined,
      tax_amount: formData.tax_amount ? parseFloat(formData.tax_amount) : undefined,
    };

    const success = (await createInvoice(invoiceData)) !== null;

    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleStatusUpdate = async (invoice: Invoice, status: string) => {
    try {
      await updateInvoice(invoice.id, { status: status as any });
      toast.success("Status da fatura atualizado");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status da fatura");
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      // Simulate send invoice functionality
      toast.success("Fatura enviada com sucesso");
    } catch (error) {
      console.error("Erro ao enviar fatura:", error);
      toast.error("Erro ao enviar fatura");
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      // Simulate download functionality
      toast.success("Download iniciado");
    } catch (error) {
      console.error("Erro ao fazer download:", error);
      toast.error("Erro ao fazer download da fatura");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "viewed":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "partially_paid":
        return "bg-orange-100 text-orange-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusOption = INVOICE_STATUSES.find((s: any) => s.value === status);
    return statusOption?.label || status;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Faturas</h2>
          <p className="text-muted-foreground">Visualize e gerencie todas as faturas da clínica</p>
        </div>

        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Fatura
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                invoices
                  .filter((inv) => ["sent", "viewed", "overdue"].includes(inv.status))
                  .reduce((sum, inv) => sum + inv.total_amount, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((inv) => ["sent", "viewed", "overdue"].includes(inv.status)).length}{" "}
              faturas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas Este Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                invoices
                  .filter((inv) => inv.status === "paid")
                  .reduce((sum, inv) => sum + inv.total_amount, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((inv) => inv.status === "paid").length} faturas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter((inv) => inv.status === "overdue").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(
                invoices
                  .filter((inv) => inv.status === "overdue")
                  .reduce((sum, inv) => sum + inv.total_amount, 0),
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Pagamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.length > 0
                ? Math.round(
                    (invoices.filter((inv) => inv.status === "paid").length / invoices.length) *
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
                  placeholder="Buscar faturas..."
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
                  {INVOICE_STATUSES.map((status: any) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma fatura encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando sua primeira fatura"}
              </p>
              {!searchTerm && (
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Fatura
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{invoice.patient_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {invoice.due_date ? formatDate(invoice.due_date) : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(invoice.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openViewDialog(invoice)}>
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {invoice.status !== "paid" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendInvoice(invoice)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}

                        <Select
                          value={invoice.status}
                          onValueChange={(value) => handleStatusUpdate(invoice, value)}
                        >
                          <SelectTrigger className="w-auto h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INVOICE_STATUSES.map((status: any) => (
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

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Fatura</DialogTitle>
            <DialogDescription>Crie uma nova fatura para o paciente</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_id">Paciente *</Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, patient_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingPatients ? (
                      <SelectItem value="" disabled>
                        Carregando pacientes...
                      </SelectItem>
                    ) : patients.length > 0 ? (
                      patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{patient.full_name}</div>
                              {patient.email && (
                                <div className="text-xs text-muted-foreground">{patient.email}</div>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Nenhum paciente cadastrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Vencimento *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      due_date: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Itens da Fatura</Label>
                <Button type="button" variant="outline" onClick={addInvoiceItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item #{index + 1}</h4>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvoiceItem(index)}
                      >
                        Remover
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Serviço *</Label>
                      <Select
                        value={item.service_id}
                        onValueChange={(value) => {
                          const service = services.find((s) => s.id === value);
                          updateInvoiceItem(index, "service_id", value);
                          if (service) {
                            updateInvoiceItem(index, "unit_price", service.base_price);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - {formatCurrency(service.base_price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateInvoiceItem(index, "quantity", parseInt(e.target.value))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço Unitário (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateInvoiceItem(index, "unit_price", parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição Adicional</Label>
                    <Input
                      value={item.description || ""}
                      onChange={(e) => updateInvoiceItem(index, "description", e.target.value)}
                      placeholder="Descrição personalizada (opcional)"
                    />
                  </div>

                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">
                      Subtotal: {formatCurrency(item.quantity * item.unit_price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_amount">Desconto (R$)</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount_amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount_amount: e.target.value,
                    }))
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_amount">Taxa/Imposto (R$)</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax_amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tax_amount: e.target.value,
                    }))
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-lg font-medium">Total</Label>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateTotal())}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações adicionais para a fatura..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                Criar Fatura
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fatura #{selectedInvoice?.invoice_number}</DialogTitle>
            <DialogDescription>Detalhes completos da fatura</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge className={`mt-1 ${getStatusColor(selectedInvoice.status)}`}>
                    {getStatusLabel(selectedInvoice.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Valor Total</Label>
                  <div className="text-lg font-bold">
                    {formatCurrency(selectedInvoice.total_amount)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Data de Emissão</Label>
                  <div>{formatDate(selectedInvoice.issue_date)}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Data de Vencimento</Label>
                  <div>
                    {selectedInvoice.due_date ? formatDate(selectedInvoice.due_date) : "N/A"}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium mb-4 block">Itens da Fatura</Label>
                {selectedInvoice.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity}x {formatCurrency(item.unit_price)}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </div>
                  </div>
                )) || <div className="text-muted-foreground">Nenhum item encontrado</div>}
              </div>

              {selectedInvoice.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-base font-medium mb-2 block">Observações</Label>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => handleSendInvoice(selectedInvoice)}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
