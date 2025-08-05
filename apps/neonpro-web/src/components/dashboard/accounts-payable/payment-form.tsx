"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Calendar } from "@/components/ui/calendar";
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
import type { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Textarea } from "@/components/ui/textarea";
import type { cn } from "@/lib/utils";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertCircle,
  CalendarIcon,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  Receipt,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";

export interface Payment {
  id: string;
  accounts_payable_id: string;
  payment_date: string;
  amount_paid: number;
  payment_method: "cash" | "check" | "bank_transfer" | "pix" | "credit_card" | "other";
  reference_number?: string;
  bank_account?: string;
  notes?: string;
  status: "pending" | "completed" | "cancelled" | "failed";
  created_by: string;
  created_at: string;
  updated_at: string;
  // Related data
  payable_invoice_number?: string;
  vendor_name?: string;
  original_amount?: number;
  remaining_balance?: number;
}

export interface PaymentFormData {
  accounts_payable_id: string;
  payment_date: Date;
  amount_paid: number;
  payment_method: "cash" | "check" | "bank_transfer" | "pix" | "credit_card" | "other";
  reference_number: string;
  bank_account: string;
  notes: string;
  is_partial_payment: boolean;
}

interface PaymentFormProps {
  payable?: any; // AccountsPayable
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const paymentMethods = [
  { value: "cash", label: "Dinheiro", icon: DollarSign },
  { value: "check", label: "Cheque", icon: FileText },
  { value: "bank_transfer", label: "Transferência Bancária", icon: CreditCard },
  { value: "pix", label: "PIX", icon: Receipt },
  { value: "credit_card", label: "Cartão de Crédito", icon: CreditCard },
  { value: "other", label: "Outro", icon: FileText },
];

const paymentStatuses = [
  {
    value: "pending",
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "completed",
    label: "Concluído",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "cancelled",
    label: "Cancelado",
    color: "bg-gray-100 text-gray-800",
  },
  { value: "failed", label: "Falhou", color: "bg-red-100 text-red-800" },
];

export default function PaymentForm({ payable, open, onOpenChange, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [previousPayments, setPreviousPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [formData, setFormData] = useState<PaymentFormData>({
    accounts_payable_id: "",
    payment_date: new Date(),
    amount_paid: 0,
    payment_method: "pix",
    reference_number: "",
    bank_account: "",
    notes: "",
    is_partial_payment: false,
  });

  // Calculate remaining balance
  const totalPaid = previousPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount_paid, 0);

  const remainingBalance = (payable?.net_amount || 0) - totalPaid;
  const isOverpayment = formData.amount_paid > remainingBalance;
  const canMakePartialPayment = remainingBalance > 0;

  useEffect(() => {
    if (payable && open) {
      setFormData((prev) => ({
        ...prev,
        accounts_payable_id: payable.id,
        amount_paid: remainingBalance > 0 ? remainingBalance : 0,
      }));
      loadPreviousPayments();
    }
  }, [payable, open]);

  const loadPreviousPayments = async () => {
    if (!payable?.id) return;

    setLoadingPayments(true);
    try {
      // Mock data - In real implementation, this would come from API
      const mockPayments: Payment[] = [
        {
          id: "1",
          accounts_payable_id: payable.id,
          payment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          amount_paid: payable.net_amount * 0.3, // 30% paid
          payment_method: "bank_transfer",
          reference_number: "TRF001234",
          status: "completed",
          created_by: "user1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          payable_invoice_number: payable.invoice_number,
          vendor_name: payable.vendor_name,
          original_amount: payable.net_amount,
          remaining_balance: payable.net_amount * 0.7,
        },
      ];

      // Only show if there are actual previous payments (simulate some history)
      if (Math.random() > 0.5) {
        setPreviousPayments(mockPayments);
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      toast.error("Erro ao carregar histórico de pagamentos");
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accounts_payable_id || formData.amount_paid <= 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (isOverpayment && !formData.is_partial_payment) {
      toast.error("Valor do pagamento excede o saldo devedor");
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        ...formData,
        payment_date: formData.payment_date.toISOString(),
        status: "completed" as const,
        created_by: "current_user", // Would come from auth context
        reference_number: formData.reference_number || `PAY${Date.now()}`,
      };

      // In real implementation, this would call payment service
      console.log("Processing payment:", paymentData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Pagamento processado com sucesso");
      onSuccess();
      onOpenChange(false);

      // Reset form
      setFormData({
        accounts_payable_id: "",
        payment_date: new Date(),
        amount_paid: 0,
        payment_method: "pix",
        reference_number: "",
        bank_account: "",
        notes: "",
        is_partial_payment: false,
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof PaymentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getPaymentMethodIcon = (method: string) => {
    const methodConfig = paymentMethods.find((m) => m.value === method);
    return methodConfig?.icon || DollarSign;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  if (!payable) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Processar Pagamento
          </DialogTitle>
          <DialogDescription>
            Registre o pagamento para a conta a pagar #{payable.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payable Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações da Conta a Pagar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Fornecedor</p>
                  <p>{payable.vendor_name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Invoice</p>
                  <p>{payable.invoice_number}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Valor Original</p>
                  <p className="font-semibold">{formatCurrency(payable.net_amount)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Saldo Devedor</p>
                  <p
                    className={cn(
                      "font-semibold",
                      remainingBalance > 0 ? "text-red-600" : "text-green-600",
                    )}
                  >
                    {formatCurrency(remainingBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Payments */}
          {previousPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Histórico de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {previousPayments.map((payment) => {
                    const IconComponent = getPaymentMethodIcon(payment.payment_method);
                    const statusConfig = paymentStatuses.find((s) => s.value === payment.status);

                    return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {formatCurrency(payment.amount_paid)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.payment_date), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs", statusConfig?.color)}>
                            {statusConfig?.label}
                          </Badge>
                          {payment.reference_number && (
                            <span className="text-xs text-muted-foreground">
                              {payment.reference_number}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dados do Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Date */}
                  <div className="space-y-2">
                    <Label htmlFor="payment_date">Data do Pagamento *</Label>
                    <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.payment_date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.payment_date ? (
                            format(formData.payment_date, "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.payment_date}
                          onSelect={(date) => {
                            if (date) {
                              updateField("payment_date", date);
                              setShowCalendar(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Método de Pagamento *</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) => updateField("payment_method", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => {
                          const IconComponent = method.icon;
                          return (
                            <SelectItem key={method.value} value={method.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {method.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount_paid">Valor do Pagamento *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount_paid"
                        type="number"
                        step="0.01"
                        value={formData.amount_paid || ""}
                        onChange={(e) =>
                          updateField("amount_paid", parseFloat(e.target.value) || 0)
                        }
                        className={cn(
                          "pl-9",
                          isOverpayment && "border-red-500 focus:border-red-500",
                        )}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    {isOverpayment && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        Valor excede o saldo devedor
                      </div>
                    )}
                    {formData.amount_paid > 0 && formData.amount_paid < remainingBalance && (
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        <AlertCircle className="h-3 w-3" />
                        Pagamento parcial - Saldo restante:{" "}
                        {formatCurrency(remainingBalance - formData.amount_paid)}
                      </div>
                    )}
                  </div>

                  {/* Reference Number */}
                  <div className="space-y-2">
                    <Label htmlFor="reference_number">Número de Referência</Label>
                    <Input
                      id="reference_number"
                      value={formData.reference_number}
                      onChange={(e) => updateField("reference_number", e.target.value)}
                      placeholder="Número do documento, TED, etc."
                    />
                  </div>
                </div>

                {/* Bank Account (conditional) */}
                {(formData.payment_method === "bank_transfer" ||
                  formData.payment_method === "pix") && (
                  <div className="space-y-2">
                    <Label htmlFor="bank_account">Conta Bancária</Label>
                    <Input
                      id="bank_account"
                      value={formData.bank_account}
                      onChange={(e) => updateField("bank_account", e.target.value)}
                      placeholder="Banco, agência, conta..."
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Informações adicionais sobre o pagamento..."
                    rows={2}
                  />
                </div>

                {/* Partial Payment Checkbox */}
                {canMakePartialPayment && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_partial_payment"
                      checked={formData.is_partial_payment}
                      onCheckedChange={(checked) => updateField("is_partial_payment", checked)}
                    />
                    <Label htmlFor="is_partial_payment" className="text-sm">
                      Este é um pagamento parcial
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              formData.amount_paid <= 0 ||
              (isOverpayment && !formData.is_partial_payment)
            }
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Processando..." : "Processar Pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
