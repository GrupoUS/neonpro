"use client";

import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { Calculator, CalendarIcon, FileText, Loader2, Receipt } from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";
import type { Button } from "@/components/ui/button";
import type { Calendar } from "@/components/ui/calendar";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";
import type { AccountsPayableService } from "@/lib/services/accounts-payable";
import type { documentsService } from "@/lib/services/documents";
import type { ExpenseCategoryService } from "@/lib/services/expense-categories";
import type { VendorService } from "@/lib/services/vendors";
import type { AccountsPayable, AccountsPayableFormData } from "@/lib/types/accounts-payable";
import type { cn } from "@/lib/utils";
import DocumentUpload from "./document-upload";

interface AccountsPayableFormProps {
  accountsPayable?: AccountsPayable;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const paymentMethods = [
  { value: "cash", label: "Dinheiro" },
  { value: "check", label: "Cheque" },
  { value: "bank_transfer", label: "Transferência Bancária" },
  { value: "pix", label: "PIX" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "other", label: "Outro" },
];

const statusOptions = [
  { value: "draft", label: "Rascunho" },
  { value: "pending", label: "Pendente" },
  { value: "approved", label: "Aprovado" },
  { value: "scheduled", label: "Agendado" },
];

const priorityOptions = [
  { value: "low", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

export function AccountsPayableForm({
  accountsPayable,
  open,
  onOpenChange,
  onSuccess,
}: AccountsPayableFormProps) {
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<{ id: string; label: string; value: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string; value: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [formData, setFormData] = useState<AccountsPayableFormData>({
    vendor_id: "",
    expense_category_id: "",
    invoice_number: "",
    invoice_date: undefined,
    due_date: "",
    gross_amount: 0,
    tax_amount: 0,
    discount_amount: 0,
    net_amount: 0,
    payment_terms_days: 30,
    payment_method: "pix",
    status: "draft",
    priority: "normal",
    description: "",
    notes: "",
  });

  const [showCalendar, setShowCalendar] = useState({
    invoice: false,
    due: false,
  });

  const loadDocuments = async () => {
    if (!accountsPayable?.id) return;

    setLoadingDocuments(true);
    try {
      const payableDocuments = await documentsService.getDocuments("payable", accountsPayable.id);
      setDocuments(payableDocuments);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      toast.error("Erro ao carregar documentos da conta a pagar");
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Load options (vendors and categories)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const [vendorsData, categoriesData] = await Promise.all([
          VendorService.getActiveVendorsForSelection(),
          ExpenseCategoryService.getActiveCategoriesForSelection(),
        ]);
        setVendors(vendorsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading options:", error);
        toast.error("Erro ao carregar opções");
      } finally {
        setLoadingOptions(false);
      }
    };

    if (open) {
      loadOptions();
    }
  }, [open]);

  // Populate form when editing existing AP
  useEffect(() => {
    if (accountsPayable && open) {
      setFormData({
        vendor_id: accountsPayable.vendor_id,
        expense_category_id: accountsPayable.expense_category_id,
        invoice_number: accountsPayable.invoice_number || "",
        invoice_date: accountsPayable.invoice_date || undefined,
        due_date: accountsPayable.due_date,
        gross_amount: accountsPayable.gross_amount,
        tax_amount: accountsPayable.tax_amount,
        discount_amount: accountsPayable.discount_amount,
        net_amount: accountsPayable.net_amount,
        payment_terms_days: accountsPayable.payment_terms_days,
        payment_method: accountsPayable.payment_method,
        status: accountsPayable.status,
        priority: accountsPayable.priority,
        description: accountsPayable.description || "",
        notes: accountsPayable.notes || "",
      });
    } else if (open && !accountsPayable) {
      // Reset form for new AP
      setFormData({
        vendor_id: "",
        expense_category_id: "",
        invoice_number: "",
        invoice_date: undefined,
        due_date: "",
        gross_amount: 0,
        tax_amount: 0,
        discount_amount: 0,
        net_amount: 0,
        payment_terms_days: 30,
        payment_method: "pix",
        status: "draft",
        priority: "normal",
        description: "",
        notes: "",
      });
    }
  }, [accountsPayable, open]);

  // Load documents when AP changes or dialog opens
  useEffect(() => {
    if (open && accountsPayable?.id) {
      loadDocuments();
    }
  }, [open, accountsPayable?.id]);

  // Calculate net amount when gross, tax, or discount changes
  useEffect(() => {
    const netAmount =
      (formData.gross_amount || 0) + (formData.tax_amount || 0) - (formData.discount_amount || 0);
    if (netAmount !== formData.net_amount) {
      setFormData((prev) => ({ ...prev, net_amount: netAmount }));
    }
  }, [formData.gross_amount, formData.tax_amount, formData.discount_amount]);

  // Auto-calculate due date when invoice date and payment terms change
  useEffect(() => {
    if (formData.invoice_date && formData.payment_terms_days) {
      const invoiceDate = new Date(formData.invoice_date);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + formData.payment_terms_days);

      const dueDateString = dueDate.toISOString().split("T")[0];
      if (dueDateString !== formData.due_date) {
        setFormData((prev) => ({ ...prev, due_date: dueDateString }));
      }
    }
  }, [formData.invoice_date, formData.payment_terms_days]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendor_id || !formData.expense_category_id || !formData.due_date) {
      toast.error("Fornecedor, categoria de despesa e data de vencimento são obrigatórios");
      return;
    }

    if (formData.net_amount <= 0) {
      toast.error("O valor líquido deve ser maior que zero");
      return;
    }

    setLoading(true);

    try {
      if (accountsPayable) {
        await AccountsPayableService.updateAccountsPayable(accountsPayable.id, formData);
        toast.success("Conta a pagar atualizada com sucesso!");
      } else {
        await AccountsPayableService.createAccountsPayable(formData);
        toast.success("Conta a pagar criada com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving accounts payable:", error);
      toast.error(error.message || "Erro ao salvar conta a pagar");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof AccountsPayableFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: Date | undefined, field: "invoice_date" | "due_date") => {
    if (date) {
      const dateString = date.toISOString().split("T")[0];
      updateField(field, dateString);
    }
    setShowCalendar((prev) => ({
      ...prev,
      [field === "invoice_date" ? "invoice" : "due"]: false,
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loadingOptions) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Carregando opções...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {accountsPayable ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
          </DialogTitle>
          <DialogDescription>
            {accountsPayable
              ? "Atualize as informações da conta a pagar."
              : "Cadastre uma nova conta a pagar no sistema."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex items-center gap-2"
              disabled={!accountsPayable?.id}
            >
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vendor_id">Fornecedor *</Label>
                    <Select
                      value={formData.vendor_id}
                      onValueChange={(value) => updateField("vendor_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.value}>
                            {vendor.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="expense_category_id">Categoria de Despesa *</Label>
                    <Select
                      value={formData.expense_category_id}
                      onValueChange={(value) => updateField("expense_category_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="invoice_number">Número da Fatura</Label>
                    <Input
                      id="invoice_number"
                      value={formData.invoice_number}
                      onChange={(e) => updateField("invoice_number", e.target.value)}
                      placeholder="NF-001234"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => updateField("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Dates */}
              <Card>
                <CardHeader>
                  <CardTitle>Datas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoice_date">Data da Fatura</Label>
                    <Popover
                      open={showCalendar.invoice}
                      onOpenChange={(open) =>
                        setShowCalendar((prev) => ({ ...prev, invoice: open }))
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.invoice_date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.invoice_date
                            ? format(new Date(formData.invoice_date), "PPP", {
                                locale: ptBR,
                              })
                            : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            formData.invoice_date ? new Date(formData.invoice_date) : undefined
                          }
                          onSelect={(date) => handleDateSelect(date, "invoice_date")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="payment_terms_days">Prazo de Pagamento (dias)</Label>
                    <Input
                      id="payment_terms_days"
                      type="number"
                      value={formData.payment_terms_days}
                      onChange={(e) =>
                        updateField("payment_terms_days", parseInt(e.target.value) || 30)
                      }
                      min="0"
                      max="365"
                    />
                  </div>

                  <div>
                    <Label htmlFor="due_date">Data de Vencimento *</Label>
                    <Popover
                      open={showCalendar.due}
                      onOpenChange={(open) => setShowCalendar((prev) => ({ ...prev, due: open }))}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.due_date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.due_date
                            ? format(new Date(formData.due_date), "PPP", {
                                locale: ptBR,
                              })
                            : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.due_date ? new Date(formData.due_date) : undefined}
                          onSelect={(date) => handleDateSelect(date, "due_date")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Informações Financeiras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="gross_amount">Valor Bruto</Label>
                      <Input
                        id="gross_amount"
                        type="number"
                        value={formData.gross_amount}
                        onChange={(e) =>
                          updateField("gross_amount", parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tax_amount">Impostos</Label>
                      <Input
                        id="tax_amount"
                        type="number"
                        value={formData.tax_amount}
                        onChange={(e) => updateField("tax_amount", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="discount_amount">Desconto</Label>
                      <Input
                        id="discount_amount"
                        type="number"
                        value={formData.discount_amount}
                        onChange={(e) =>
                          updateField("discount_amount", parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Valor Líquido:</span>
                      <span className="text-2xl">{formatCurrency(formData.net_amount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_method">Método de Pagamento</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) => updateField("payment_method", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => updateField("priority", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Descrição da despesa..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Observações internas..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            {accountsPayable?.id && (
              <DocumentUpload
                entityType="payable"
                entityId={accountsPayable.id}
                existingDocuments={documents}
                onDocumentsChange={loadDocuments}
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {accountsPayable ? "Atualizar" : "Criar"} Conta a Pagar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
