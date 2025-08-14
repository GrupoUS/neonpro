"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Building,
  Calendar,
  CheckCircle,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Printer,
  Receipt,
  Share,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface PaymentVoucher {
  id: string;
  voucher_number: string;
  payment_id: string;
  accounts_payable_id: string;
  payment_date: string;
  amount_paid: number;
  payment_method: string;
  reference_number?: string;
  bank_account?: string;
  notes?: string;
  status: "generated" | "sent" | "archived";
  created_at: string;

  // Related data
  invoice_number: string;
  vendor_name: string;
  vendor_document: string;
  vendor_address?: string;
  original_amount: number;
  remaining_balance: number;

  // Company data
  company_name: string;
  company_document: string;
  company_address: string;
  company_phone?: string;
  company_email?: string;
}

interface PaymentVoucherGeneratorProps {
  payment?: any; // Payment data
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated?: (voucher: PaymentVoucher) => void;
}

const paymentMethodLabels: Record<string, string> = {
  cash: "Dinheiro",
  check: "Cheque",
  bank_transfer: "Transferência Bancária",
  pix: "PIX",
  credit_card: "Cartão de Crédito",
  other: "Outro",
};

export default function PaymentVoucherGenerator({
  payment,
  open,
  onOpenChange,
  onGenerated,
}: PaymentVoucherGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [voucher, setVoucher] = useState<PaymentVoucher | null>(null);

  // Mock company data - In real implementation, this would come from settings/profile
  const companyData = {
    company_name: "NeonPro Clínica Estética",
    company_document: "12.345.678/0001-90",
    company_address:
      "Av. das Clínicas, 123 - Centro - São Paulo/SP - CEP: 01234-567",
    company_phone: "(11) 3456-7890",
    company_email: "contato@neonpro.com.br",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDocument = (document: string) => {
    // Format CNPJ or CPF
    if (document.length === 14) {
      return document.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    } else if (document.length === 11) {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return document;
  };

  const generateVoucher = async () => {
    if (!payment) return;

    setGenerating(true);
    try {
      // Simulate voucher generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newVoucher: PaymentVoucher = {
        id: `voucher_${Date.now()}`,
        voucher_number: `CV${new Date().getFullYear()}${String(
          Date.now()
        ).slice(-6)}`,
        payment_id: payment.id || "payment_1",
        accounts_payable_id: payment.accounts_payable_id || "ap_1",
        payment_date: payment.payment_date || new Date().toISOString(),
        amount_paid: payment.amount_paid || 1500.0,
        payment_method: payment.payment_method || "pix",
        reference_number: payment.reference_number || "PIX123456789",
        bank_account: payment.bank_account,
        notes: payment.notes,
        status: "generated",
        created_at: new Date().toISOString(),

        // Mock related data
        invoice_number: "INV-2024-001",
        vendor_name: "Fornecedor Alpha Ltda",
        vendor_document: "12345678000190",
        vendor_address:
          "Rua do Fornecedor, 456 - Distrito Industrial - São Paulo/SP",
        original_amount: payment.original_amount || 1500.0,
        remaining_balance:
          (payment.original_amount || 1500.0) - (payment.amount_paid || 1500.0),

        ...companyData,
      };

      setVoucher(newVoucher);
      onGenerated?.(newVoucher);
      toast.success("Comprovante gerado com sucesso!");
    } catch (error) {
      console.error("Error generating voucher:", error);
      toast.error("Erro ao gerar comprovante");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    // In real implementation, this would generate and download a PDF
    toast.success("PDF baixado com sucesso!");
  };

  const handlePrint = () => {
    // In real implementation, this would trigger browser print
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share && voucher) {
      try {
        await navigator.share({
          title: `Comprovante de Pagamento ${voucher.voucher_number}`,
          text: `Comprovante de pagamento no valor de ${formatCurrency(
            voucher.amount_paid
          )} para ${voucher.vendor_name}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && voucher) {
      const link = `${window.location.origin}/dashboard/payments/voucher/${voucher.id}`;
      navigator.clipboard.writeText(link);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const PaymentMethodIcon = ({ method }: { method: string }) => {
    switch (method) {
      case "pix":
        return <Receipt className="h-4 w-4" />;
      case "bank_transfer":
        return <CreditCard className="h-4 w-4" />;
      case "check":
        return <FileText className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Comprovante de Pagamento
          </DialogTitle>
          <DialogDescription>
            Gere e gerencie comprovantes de pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!voucher ? (
            // Generation Form
            <div className="text-center py-8">
              <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gerar Comprovante</h3>
              <p className="text-muted-foreground mb-6">
                Clique no botão abaixo para gerar o comprovante deste pagamento
              </p>
              <Button onClick={generateVoucher} disabled={generating} size="lg">
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4 mr-2" />
                    Gerar Comprovante
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Voucher Display
            <div className="space-y-6" id="voucher-content">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold">COMPROVANTE DE PAGAMENTO</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Nº {voucher.voucher_number}
                </p>
              </div>

              {/* Company Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Dados da Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold">{voucher.company_name}</p>
                      <p className="text-sm text-muted-foreground">
                        CNPJ: {formatDocument(voucher.company_document)}
                      </p>
                    </div>
                    <p className="text-sm">{voucher.company_address}</p>
                    {voucher.company_phone && (
                      <p className="text-sm">Tel: {voucher.company_phone}</p>
                    )}
                    {voucher.company_email && (
                      <p className="text-sm">E-mail: {voucher.company_email}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vendor Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados do Fornecedor
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold">{voucher.vendor_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {voucher.vendor_document.length > 11 ? "CNPJ" : "CPF"}:{" "}
                        {formatDocument(voucher.vendor_document)}
                      </p>
                    </div>
                    {voucher.vendor_address && (
                      <p className="text-sm">{voucher.vendor_address}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Detalhes do Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Invoice
                        </p>
                        <p className="font-semibold">
                          {voucher.invoice_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Data do Pagamento
                        </p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-semibold">
                            {format(
                              new Date(voucher.payment_date),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR }
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Método de Pagamento
                        </p>
                        <div className="flex items-center gap-2">
                          <PaymentMethodIcon method={voucher.payment_method} />
                          <p className="font-semibold">
                            {paymentMethodLabels[voucher.payment_method] ||
                              voucher.payment_method}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Valor Original
                        </p>
                        <p className="font-semibold">
                          {formatCurrency(voucher.original_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Valor Pago
                        </p>
                        <p className="font-bold text-lg text-green-600">
                          {formatCurrency(voucher.amount_paid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Saldo Remanescente
                        </p>
                        <p
                          className={cn(
                            "font-semibold",
                            voucher.remaining_balance > 0
                              ? "text-yellow-600"
                              : "text-green-600"
                          )}
                        >
                          {formatCurrency(voucher.remaining_balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {voucher.reference_number && <Separator className="my-4" />}

                  {voucher.reference_number && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Número de Referência
                      </p>
                      <p className="font-semibold">
                        {voucher.reference_number}
                      </p>
                    </div>
                  )}

                  {voucher.bank_account && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Conta Bancária
                      </p>
                      <p className="font-semibold">{voucher.bank_account}</p>
                    </div>
                  )}

                  {voucher.notes && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Observações
                      </p>
                      <p className="text-sm">{voucher.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status and Timestamp */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-600">
                      Pagamento Confirmado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Comprovante gerado em{" "}
                      {format(
                        new Date(voucher.created_at),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="text-green-700 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Válido
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button onClick={handleDownloadPDF} variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>

                <Button onClick={handlePrint} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>

                <Button onClick={handleShare} variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>

                <Button onClick={handleCopyLink} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>

                <Button
                  onClick={() =>
                    window.open(
                      `/dashboard/payments/voucher/${voucher.id}`,
                      "_blank"
                    )
                  }
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir em Nova Aba
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
