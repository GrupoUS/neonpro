"use client";

/**
 * Invoice Manager Component
 * Created: January 27, 2025
 * Purpose: Comprehensive invoice management UI for Epic 4
 * Features: Create, edit, view, manage invoices with NFSe integration
 */

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
import type { Separator } from "@/components/ui/separator";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";

// Icons
import type {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Download,
  Edit,
  FileText,
  Plus,
  Search,
  Send,
} from "lucide-react";

// Types
import type {
  CreateInvoiceInput,
  FinancialSummary,
  Invoice,
  InvoiceStatus,
} from "@/lib/types/financial";

// Services
import type {
  createInvoice,
  getFinancialSummary,
  getInvoiceById,
  listInvoices,
  updateInvoice,
} from "@/lib/supabase/financial";

interface InvoiceManagerProps {
  clinicId: string;
  defaultView?: "list" | "create" | "edit";
  selectedInvoiceId?: string;
}

export function InvoiceManager({
  clinicId,
  defaultView = "list",
  selectedInvoiceId,
}: InvoiceManagerProps) {
  const router = useRouter();

  // State Management
  const [activeTab, setActiveTab] = useState<"list" | "create" | "edit">(defaultView);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State for Create/Edit
  const [formData, setFormData] = useState<Partial<CreateInvoiceInput>>({
    patient_id: "",
    description: "",
    due_date: "",
    items: [],
  });

  // Load Data
  useEffect(() => {
    loadInvoices();
    loadSummary();
  }, [clinicId]);

  useEffect(() => {
    if (selectedInvoiceId && activeTab === "edit") {
      loadInvoiceDetails(selectedInvoiceId);
    }
  }, [selectedInvoiceId, activeTab]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const result = await listInvoices({ clinic_id: clinicId }, 1, 100);
      if (result.invoices) {
        setInvoices(result.invoices);
      }
    } catch (error) {
      console.error("Failed to load invoices:", error);
      toast.error("Erro ao carregar faturas");
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const result = await getFinancialSummary({ clinic_id: clinicId });
      setSummary(result);
    } catch (error) {
      console.error("Failed to load summary:", error);
    }
  };

  const loadInvoiceDetails = async (invoiceId: string) => {
    try {
      setLoading(true);
      const result = await getInvoiceById(invoiceId);
      setSelectedInvoice(result);
      setFormData({
        patient_id: result.patient_id,
        description: result.description,
        due_date: result.due_date || "",
        items: result.invoice_items || [],
      });
    } catch (error) {
      console.error("Failed to load invoice details:", error);
      toast.error("Erro ao carregar detalhes da fatura");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleCreateInvoice = async () => {
    try {
      setLoading(true);

      const invoiceData: CreateInvoiceInput = {
        ...(formData as CreateInvoiceInput),
        clinic_id: clinicId,
      };

      const result = await createInvoice(invoiceData);

      toast.success("Fatura criada com sucesso!");
      setActiveTab("list");
      setFormData({
        patient_id: "",
        description: "",
        due_date: "",
        items: [],
      });
      loadInvoices();
      loadSummary();
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error("Erro ao criar fatura");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      setLoading(true);

      const result = await updateInvoice(selectedInvoice.id, {
        description: formData.description || "",
        due_date: formData.due_date,
      });

      toast.success("Fatura atualizada com sucesso!");
      setActiveTab("list");
      loadInvoices();
      loadSummary();
    } catch (error) {
      console.error("Failed to update invoice:", error);
      toast.error("Erro ao atualizar fatura");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      // Mock PDF download - replace with actual implementation
      toast.success("Funcionalidade de PDF será implementada em breve");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Erro ao baixar PDF");
    }
  };

  const handleSendEmail = async (invoiceId: string) => {
    try {
      // Mock email sending - replace with actual implementation
      toast.success("Funcionalidade de email será implementada em breve");
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Erro ao enviar email");
    }
  };

  // Filter invoices by search term
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Status badge color mapping
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "issued":
        return "bg-blue-500";
      case "sent":
        return "bg-purple-500";
      case "overdue":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-yellow-500"; // draft
    }
  };

  const getStatusText = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "issued":
        return "Emitido";
      case "sent":
        return "Enviado";
      case "overdue":
        return "Vencido";
      case "cancelled":
        return "Cancelado";
      default:
        return "Rascunho"; // draft
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Faturas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_invoices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(summary.total_amount / 100).toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pago</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {(summary.total_paid / 100).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                R$ {(summary.total_pending / 100).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Faturas</CardTitle>
          <CardDescription>Crie, edite e gerencie faturas para seus pacientes</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Lista de Faturas</TabsTrigger>
              <TabsTrigger value="create">Criar Fatura</TabsTrigger>
              <TabsTrigger value="edit" disabled={!selectedInvoice}>
                Editar Fatura
              </TabsTrigger>
            </TabsList>

            {/* Invoice List Tab */}
            <TabsContent value="list" className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar faturas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Fatura
                </Button>
              </div>

              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma fatura encontrada
                  </div>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <Card key={invoice.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">#{invoice.invoice_number}</span>
                            <Badge className={getStatusColor(invoice.status)}>
                              {getStatusText(invoice.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.patient?.name} • {invoice.description}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Valor: R$ {(invoice.total_amount / 100).toFixed(2)}
                            {invoice.due_date &&
                              ` • Vence: ${new Date(invoice.due_date).toLocaleDateString("pt-BR")}`}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(invoice.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>

                          {invoice.status !== "sent" && invoice.status !== "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendEmail(invoice.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
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

            {/* Create Invoice Tab */}
            <TabsContent value="create" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Input
                    id="patient"
                    placeholder="ID do paciente"
                    value={formData.patient_id || ""}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição dos serviços..."
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="due_date">Data de Vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date || ""}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setActiveTab("list")}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateInvoice} disabled={loading}>
                  {loading ? "Criando..." : "Criar Fatura"}
                </Button>
              </div>
            </TabsContent>

            {/* Edit Invoice Tab */}
            <TabsContent value="edit" className="space-y-4">
              {selectedInvoice && (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Número da Fatura</Label>
                    <Input value={selectedInvoice.invoice_number} disabled />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit_description">Descrição</Label>
                    <Textarea
                      id="edit_description"
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit_due_date">Data de Vencimento</Label>
                    <Input
                      id="edit_due_date"
                      type="date"
                      value={formData.due_date || ""}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setActiveTab("list")}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateInvoice} disabled={loading}>
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
