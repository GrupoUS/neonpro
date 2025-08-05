"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { Separator } from "@/components/ui/separator";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { cn } from "@/lib/utils";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertCircle,
  Calculator,
  CheckCircle,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Loader2,
  Receipt,
  Search,
} from "lucide-react";
import type { useMemo, useState } from "react";
import type { toast } from "sonner";

export interface BulkPayableItem {
  id: string;
  invoice_number: string;
  vendor_name: string;
  vendor_id: string;
  due_date: string;
  net_amount: number;
  paid_amount: number;
  remaining_balance: number;
  priority: "high" | "medium" | "low";
  category: string;
  status: "pending" | "overdue" | "partial";
  days_overdue?: number;
  selected: boolean;
  suggested_payment: number;
}

interface BulkPaymentProcessorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const paymentMethods = [
  { value: "bank_transfer", label: "Transferência Bancária", icon: CreditCard },
  { value: "pix", label: "PIX", icon: Receipt },
  { value: "check", label: "Cheque", icon: FileText },
  { value: "cash", label: "Dinheiro", icon: DollarSign },
];

const filterOptions = [
  { value: "all", label: "Todos" },
  { value: "overdue", label: "Em Atraso" },
  { value: "due_today", label: "Vencem Hoje" },
  { value: "due_week", label: "Vencem Esta Semana" },
  { value: "high_priority", label: "Alta Prioridade" },
  { value: "high_amount", label: "Alto Valor (>R$ 1.000)" },
];

export default function BulkPaymentProcessor({
  open,
  onOpenChange,
  onSuccess,
}: BulkPaymentProcessorProps) {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("pix");
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<number>(0);

  // Mock data - In real implementation, this would come from API
  const [payableItems, setPayableItems] = useState<BulkPayableItem[]>([
    {
      id: "1",
      invoice_number: "INV-2024-001",
      vendor_name: "Fornecedor Alpha Ltda",
      vendor_id: "v1",
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days overdue
      net_amount: 1500.0,
      paid_amount: 0,
      remaining_balance: 1500.0,
      priority: "high",
      category: "Equipamentos",
      status: "overdue",
      days_overdue: 2,
      selected: false,
      suggested_payment: 1500.0,
    },
    {
      id: "2",
      invoice_number: "INV-2024-002",
      vendor_name: "Beta Suprimentos",
      vendor_id: "v2",
      due_date: new Date().toISOString(), // Due today
      net_amount: 850.0,
      paid_amount: 200.0,
      remaining_balance: 650.0,
      priority: "medium",
      category: "Material de Consumo",
      status: "partial",
      selected: false,
      suggested_payment: 650.0,
    },
    {
      id: "3",
      invoice_number: "INV-2024-003",
      vendor_name: "Gamma Serviços",
      vendor_id: "v3",
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      net_amount: 2200.0,
      paid_amount: 0,
      remaining_balance: 2200.0,
      priority: "high",
      category: "Serviços",
      status: "pending",
      selected: false,
      suggested_payment: 2200.0,
    },
    {
      id: "4",
      invoice_number: "INV-2024-004",
      vendor_name: "Delta Tecnologia",
      vendor_id: "v4",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      net_amount: 450.0,
      paid_amount: 0,
      remaining_balance: 450.0,
      priority: "low",
      category: "Software",
      status: "pending",
      selected: false,
      suggested_payment: 450.0,
    },
  ]);

  // Filtered items based on search and filter
  const filteredItems = useMemo(() => {
    let items = payableItems;

    // Apply search filter
    if (searchTerm) {
      items = items.filter(
        (item) =>
          item.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply type filter
    switch (filterType) {
      case "overdue":
        items = items.filter((item) => item.status === "overdue");
        break;
      case "due_today":
        const today = new Date().toDateString();
        items = items.filter((item) => new Date(item.due_date).toDateString() === today);
        break;
      case "due_week":
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        items = items.filter((item) => new Date(item.due_date) <= weekFromNow);
        break;
      case "high_priority":
        items = items.filter((item) => item.priority === "high");
        break;
      case "high_amount":
        items = items.filter((item) => item.remaining_balance > 1000);
        break;
    }

    return items;
  }, [payableItems, searchTerm, filterType]);

  // Selected items calculations
  const selectedItems = filteredItems.filter((item) => item.selected);
  const totalSelectedAmount = selectedItems.reduce((sum, item) => sum + item.suggested_payment, 0);
  const selectedCount = selectedItems.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setPayableItems((items) =>
      items.map((item) => {
        const isVisible = filteredItems.some((fi) => fi.id === item.id);
        return isVisible ? { ...item, selected: checked } : item;
      }),
    );
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setPayableItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, selected: checked } : item)),
    );
  };

  const handleUpdateSuggestedPayment = (itemId: string, amount: number) => {
    setPayableItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              suggested_payment: Math.min(amount, item.remaining_balance),
            }
          : item,
      ),
    );
  };

  const handleApplyMaxPayment = () => {
    if (maxPaymentAmount <= 0) return;

    let remainingBudget = maxPaymentAmount;
    const sortedItems = [...selectedItems].sort((a, b) => {
      // Prioritize overdue items first, then by priority, then by amount
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (b.status === "overdue" && a.status !== "overdue") return 1;

      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return b.remaining_balance - a.remaining_balance;
    });

    setPayableItems((items) =>
      items.map((item) => {
        if (!selectedItems.some((si) => si.id === item.id)) return item;

        const suggestedAmount = Math.min(item.remaining_balance, remainingBudget);
        remainingBudget = Math.max(0, remainingBudget - suggestedAmount);

        return { ...item, suggested_payment: suggestedAmount };
      }),
    );
  };

  const handleProcessPayments = async () => {
    if (selectedItems.length === 0) {
      toast.error("Selecione pelo menos um item para processar");
      return;
    }

    setProcessing(true);
    setProcessedCount(0);

    try {
      // Process each selected payment
      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];

        // Simulate API call for each payment
        const paymentData = {
          accounts_payable_id: item.id,
          payment_date: new Date().toISOString(),
          amount_paid: item.suggested_payment,
          payment_method: selectedPaymentMethod,
          reference_number: `BULK${Date.now()}-${i + 1}`,
          notes: `Pagamento em lote - ${selectedItems.length} itens`,
          status: "completed",
        };

        console.log("Processing payment:", paymentData);

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setProcessedCount(i + 1);
      }

      toast.success(`${selectedItems.length} pagamentos processados com sucesso`);
      onSuccess();
      onOpenChange(false);

      // Reset selections
      setPayableItems((items) => items.map((item) => ({ ...item, selected: false })));
    } catch (error) {
      console.error("Error processing bulk payments:", error);
      toast.error("Erro ao processar pagamentos em lote");
    } finally {
      setProcessing(false);
      setProcessedCount(0);
    }
  };

  const handleExportSelected = () => {
    const csvContent = [
      "Invoice,Fornecedor,Vencimento,Valor Original,Saldo Devedor,Pagamento Sugerido,Prioridade,Status",
      ...selectedItems.map((item) =>
        [
          item.invoice_number,
          item.vendor_name,
          format(new Date(item.due_date), "dd/MM/yyyy"),
          item.net_amount.toFixed(2),
          item.remaining_balance.toFixed(2),
          item.suggested_payment.toFixed(2),
          item.priority,
          item.status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pagamentos-lote-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Processamento de Pagamentos em Lote
          </DialogTitle>
          <DialogDescription>
            Selecione e processe múltiplas contas a pagar simultaneamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center p-4">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{filteredItems.length}</p>
                  <p className="text-xs text-muted-foreground">Itens Disponíveis</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-4">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{selectedCount}</p>
                  <p className="text-xs text-muted-foreground">Selecionados</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-4">
                <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalSelectedAmount)}</p>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-4">
                <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {filteredItems.filter((i) => i.status === "overdue").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Em Atraso</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filtros e Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Pesquisar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Invoice, fornecedor, categoria..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Filtrar por</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Método de Pagamento</Label>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <method.icon className="h-4 w-4" />
                            {method.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Budget Management */}
              <div className="space-y-2">
                <Label>Orçamento Máximo (opcional)</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      step="0.01"
                      value={maxPaymentAmount || ""}
                      onChange={(e) => setMaxPaymentAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Valor máximo para distribuir"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyMaxPayment}
                    disabled={maxPaymentAmount <= 0 || selectedCount === 0}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Aplicar
                  </Button>
                </div>
                {maxPaymentAmount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    O valor será distribuído priorizando contas em atraso e de alta prioridade
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedCount === filteredItems.length && filteredItems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm">
                    Selecionar todos ({filteredItems.length})
                  </Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportSelected}
                  disabled={selectedCount === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor Original</TableHead>
                      <TableHead>Saldo Devedor</TableHead>
                      <TableHead>Pagamento Sugerido</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          Nenhum item encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id} className={cn(item.selected && "bg-muted/50")}>
                          <TableCell>
                            <Checkbox
                              checked={item.selected}
                              onCheckedChange={(checked) =>
                                handleSelectItem(item.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.invoice_number}
                            {item.days_overdue && item.days_overdue > 0 && (
                              <div className="text-xs text-red-600">
                                {item.days_overdue} dias em atraso
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{item.vendor_name}</TableCell>
                          <TableCell>
                            {format(new Date(item.due_date), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell>{formatCurrency(item.net_amount)}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(item.remaining_balance)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.suggested_payment || ""}
                              onChange={(e) =>
                                handleUpdateSuggestedPayment(
                                  item.id,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-24"
                              max={item.remaining_balance}
                              disabled={!item.selected}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs", getPriorityColor(item.priority))}>
                              {item.priority.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs", getStatusColor(item.status))}>
                              {item.status === "overdue"
                                ? "Em Atraso"
                                : item.status === "partial"
                                  ? "Parcial"
                                  : "Pendente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Processing Progress */}
          {processing && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Processando pagamentos...</span>
                    <span className="text-sm text-muted-foreground">
                      {processedCount}/{selectedCount}
                    </span>
                  </div>
                  <Progress value={(processedCount / selectedCount) * 100} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedCount > 0 && (
                <>
                  {selectedCount} itens selecionados • Total: {formatCurrency(totalSelectedAmount)}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={processing}
              >
                Cancelar
              </Button>
              <Button onClick={handleProcessPayments} disabled={selectedCount === 0 || processing}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando... {processedCount}/{selectedCount}
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Processar {selectedCount} Pagamentos
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
