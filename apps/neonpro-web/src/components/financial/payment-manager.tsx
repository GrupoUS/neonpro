"use client";

/**
 * Payment Manager Component
 * Created: January 27, 2025
 * Purpose: Comprehensive payment management UI for Epic 4
 * Features: Create, edit, view, manage payments with installments
 */

// Icons
import type {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import type { useRouter } from "next/navigation";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";
// UI Components
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Services
import type {
  createPayment,
  getPaymentById,
  listPaymentsByInvoice,
  updatePayment,
} from "@/lib/supabase/financial";
// Types
import type {
  CreatePaymentInput,
  Payment,
  PaymentMethod,
  PaymentProcessingStatus,
  UpdatePaymentInput,
} from "@/lib/types/financial";

interface PaymentManagerProps {
  invoiceId?: string;
  defaultView?: "list" | "create" | "edit";
  selectedPaymentId?: string;
}

export function PaymentManager({
  invoiceId,
  defaultView = "list",
  selectedPaymentId,
}: PaymentManagerProps) {
  const router = useRouter();

  // State Management
  const [activeTab, setActiveTab] = useState<"list" | "create" | "edit">(defaultView);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State for Create/Edit
  const [formData, setFormData] = useState<
    Partial<CreatePaymentInput> & { status?: PaymentProcessingStatus }
  >({
    invoice_id: invoiceId || "",
    payment_method: "credit_card",
    amount: 0,
    external_transaction_id: "",
    authorization_code: "",
  });

  // Load Data
  useEffect(() => {
    if (invoiceId) {
      loadPayments();
    }
  }, [invoiceId]);

  useEffect(() => {
    if (selectedPaymentId && activeTab === "edit") {
      loadPaymentDetails(selectedPaymentId);
    }
  }, [selectedPaymentId, activeTab]);

  const loadPayments = async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      const result = await listPaymentsByInvoice(invoiceId);
      setPayments(result);
    } catch (error) {
      console.error("Failed to load payments:", error);
      toast.error("Erro ao carregar pagamentos");
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentDetails = async (paymentId: string) => {
    try {
      setLoading(true);
      const result = await getPaymentById(paymentId);
      setSelectedPayment(result);
      setFormData({
        invoice_id: result.invoice_id,
        payment_method: result.payment_method,
        amount: result.amount / 100, // Convert from centavos
        external_transaction_id: result.external_transaction_id || "",
        authorization_code: result.authorization_code || "",
        status: result.status,
      });
    } catch (error) {
      console.error("Failed to load payment details:", error);
      toast.error("Erro ao carregar detalhes do pagamento");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleCreatePayment = async () => {
    try {
      setLoading(true);

      const paymentData: CreatePaymentInput = {
        ...(formData as CreatePaymentInput),
        invoice_id: invoiceId || formData.invoice_id || "",
      };

      const result = await createPayment(paymentData);

      toast.success("Pagamento criado com sucesso!");
      setActiveTab("list");
      setFormData({
        invoice_id: invoiceId || "",
        payment_method: "credit_card",
        amount: 0,
        external_transaction_id: "",
        authorization_code: "",
      });
      loadPayments();
    } catch (error) {
      console.error("Failed to create payment:", error);
      toast.error("Erro ao criar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!selectedPayment) return;

    try {
      setLoading(true);

      const updateData: UpdatePaymentInput = {
        status: formData.status as PaymentProcessingStatus,
        external_transaction_id: formData.external_transaction_id,
        authorization_code: formData.authorization_code,
      };

      const result = await updatePayment(selectedPayment.id, updateData);

      toast.success("Pagamento atualizado com sucesso!");
      setActiveTab("list");
      loadPayments();
    } catch (error) {
      console.error("Failed to update payment:", error);
      toast.error("Erro ao atualizar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId: string, status: PaymentProcessingStatus) => {
    try {
      await updatePayment(paymentId, { status });
      toast.success("Status atualizado com sucesso!");
      loadPayments();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  // Filter payments by search term
  const filteredPayments = payments.filter(
    (payment) =>
      payment.external_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.authorization_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_method.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Status badge color mapping
  const getStatusColor = (status: PaymentProcessingStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      case "refunded":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: PaymentProcessingStatus) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "processing":
        return "Processando";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falhou";
      case "cancelled":
        return "Cancelado";
      case "refunded":
        return "Reembolsado";
      default:
        return "Desconhecido";
    }
  };

  const getStatusIcon = (status: PaymentProcessingStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "refunded":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getMethodText = (method: PaymentMethod) => {
    switch (method) {
      case "credit_card":
        return "Cartão de Crédito";
      case "debit_card":
        return "Cartão de Débito";
      case "bank_transfer":
        return "Transferência Bancária";
      case "pix":
        return "PIX";
      case "cash":
        return "Dinheiro";
      case "financing":
        return "Financiamento";
      case "installment":
        return "Parcelado";
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Pagamentos</CardTitle>
          <CardDescription>Gerencie pagamentos e atualize status de transações</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Lista de Pagamentos</TabsTrigger>
              <TabsTrigger value="create">Criar Pagamento</TabsTrigger>
              <TabsTrigger value="edit" disabled={!selectedPayment}>
                Editar Pagamento
              </TabsTrigger>
            </TabsList>

            {/* Payment List Tab */}
            <TabsContent value="list" className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pagamentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pagamento
                </Button>
              </div>

              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : filteredPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum pagamento encontrado
                  </div>
                ) : (
                  filteredPayments.map((payment) => (
                    <Card key={payment.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(payment.status)}
                            <Badge className={getStatusColor(payment.status)}>
                              {getStatusText(payment.status)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {getMethodText(payment.payment_method)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Valor: R$ {(payment.amount / 100).toFixed(2)}
                          </div>
                          {payment.external_transaction_id && (
                            <div className="text-sm text-muted-foreground">
                              ID: {payment.external_transaction_id}
                            </div>
                          )}
                          {payment.processed_at && (
                            <div className="text-sm text-muted-foreground">
                              Processado:{" "}
                              {new Date(payment.processed_at).toLocaleDateString("pt-BR")}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {payment.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(payment.id, "completed")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(payment.id, "failed")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Falhar
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setActiveTab("edit");
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Create Payment Tab */}
            <TabsContent value="create" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="invoice_id">ID da Fatura</Label>
                  <Input
                    id="invoice_id"
                    placeholder="ID da fatura"
                    value={formData.invoice_id || ""}
                    onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
                    disabled={!!invoiceId}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="payment_method">Método de Pagamento</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        payment_method: value as PaymentMethod,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                      <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="financing">Financiamento</SelectItem>
                      <SelectItem value="installment">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="external_transaction_id">ID da Transação Externa</Label>
                  <Input
                    id="external_transaction_id"
                    placeholder="ID da transação do processador"
                    value={formData.external_transaction_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        external_transaction_id: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="authorization_code">Código de Autorização</Label>
                  <Input
                    id="authorization_code"
                    placeholder="Código de autorização"
                    value={formData.authorization_code || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        authorization_code: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setActiveTab("list")}>
                  Cancelar
                </Button>
                <Button onClick={handleCreatePayment} disabled={loading}>
                  {loading ? "Criando..." : "Criar Pagamento"}
                </Button>
              </div>
            </TabsContent>

            {/* Edit Payment Tab */}
            <TabsContent value="edit" className="space-y-4">
              {selectedPayment && (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>ID do Pagamento</Label>
                    <Input value={selectedPayment.id} disabled />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit_status">Status</Label>
                    <Select
                      value={formData.status as string}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as PaymentProcessingStatus,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="processing">Processando</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="failed">Falhou</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="refunded">Reembolsado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit_external_transaction_id">ID da Transação Externa</Label>
                    <Input
                      id="edit_external_transaction_id"
                      value={formData.external_transaction_id || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          external_transaction_id: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit_authorization_code">Código de Autorização</Label>
                    <Input
                      id="edit_authorization_code"
                      value={formData.authorization_code || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          authorization_code: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setActiveTab("list")}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdatePayment} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
