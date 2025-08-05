"use client";

import React, { useState } from "react";
import type { Button } from "@/components/ui/button";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  MoreHorizontal,
  Download,
  Mail,
  CreditCard,
  Eye,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type { toast } from "sonner";
import PaymentForm from "./payment-form";
import StripeProvider from "./stripe-provider";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  status: string;
  due_date: string;
  email_sent_at?: string | null;
}

interface InvoiceActionsProps {
  invoice: Invoice;
  onStatusUpdate?: () => void;
}

export default function InvoiceActions({ invoice, onStatusUpdate }: InvoiceActionsProps) {
  const [isLoading, setIsLoading] = useState<{
    email: boolean;
    pdf: boolean;
    payment: boolean;
  }>({
    email: false,
    pdf: false,
    payment: false,
  });

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);

  const handleSendEmail = async () => {
    setIsLoading((prev) => ({ ...prev, email: true }));

    try {
      const response = await fetch("/api/email/send-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          includeAttachment: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar email");
      }

      toast.success("Email enviado com sucesso!");

      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao enviar email: ${errorMessage}`);
    } finally {
      setIsLoading((prev) => ({ ...prev, email: false }));
    }
  };

  const handleDownloadPDF = async () => {
    setIsLoading((prev) => ({ ...prev, pdf: true }));

    try {
      const response = await fetch(`/api/pdf/invoice?id=${invoice.id}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar PDF");
      }

      // Criar blob e baixar arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `fatura-${invoice.invoice_number}.pdf`;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao baixar PDF: ${errorMessage}`);
    } finally {
      setIsLoading((prev) => ({ ...prev, pdf: false }));
    }
  };

  const handlePreviewPDF = async () => {
    setIsLoading((prev) => ({ ...prev, pdf: true }));

    try {
      const response = await fetch("/api/pdf/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          preview: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar PDF");
      }

      setPdfData(data.pdfData);
      setShowPdfPreview(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao visualizar PDF: ${errorMessage}`);
    } finally {
      setIsLoading((prev) => ({ ...prev, pdf: false }));
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    toast.success("Pagamento processado com sucesso!");
    setShowPaymentDialog(false);

    if (onStatusUpdate) {
      onStatusUpdate();
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Erro no pagamento: ${error}`);
  };

  const canPay = invoice.status === "pending" || invoice.status === "overdue";
  const isPaid = invoice.status === "paid";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {/* Visualizar PDF */}
          <DropdownMenuItem onClick={handlePreviewPDF} disabled={isLoading.pdf}>
            {isLoading.pdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            Visualizar PDF
          </DropdownMenuItem>

          {/* Baixar PDF */}
          <DropdownMenuItem onClick={handleDownloadPDF} disabled={isLoading.pdf}>
            {isLoading.pdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Baixar PDF
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Enviar Email */}
          <DropdownMenuItem onClick={handleSendEmail} disabled={isLoading.email}>
            {isLoading.email ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            {invoice.email_sent_at ? "Reenviar Email" : "Enviar Email"}
            {invoice.email_sent_at && <CheckCircle className="ml-1 h-3 w-3 text-green-600" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Pagamento */}
          {canPay && (
            <DropdownMenuItem
              onClick={() => setShowPaymentDialog(true)}
              disabled={isLoading.payment}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Realizar Pagamento
            </DropdownMenuItem>
          )}

          {isPaid && (
            <DropdownMenuItem disabled>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Pago
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Pagamento */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Realizar Pagamento</DialogTitle>
            <DialogDescription>
              Fatura #{invoice.invoice_number} - Vencimento:{" "}
              {new Date(invoice.due_date).toLocaleDateString("pt-BR")}
            </DialogDescription>
          </DialogHeader>

          <StripeProvider>
            <PaymentForm
              invoiceId={invoice.id}
              amount={invoice.total}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </StripeProvider>
        </DialogContent>
      </Dialog>

      {/* Dialog de Preview PDF */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Visualizar Fatura #{invoice.invoice_number}</DialogTitle>
          </DialogHeader>

          {pdfData && (
            <div className="flex-1 min-h-[600px]">
              <iframe
                src={pdfData}
                className="w-full h-[600px] border rounded-md"
                title={`Fatura ${invoice.invoice_number}`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
