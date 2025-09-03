/**
 * Payment Status Table Component
 * Based on TweakCN NEONPRO theme with status badges (success/processing/failed/pending)
 * Optimized for Brazilian healthcare payment tracking
 */

import { cn } from "@neonpro/utils";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Eye,
  Filter,
  Search,
  User,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";

// Brazilian payment methods
export type BrazilianPaymentMethod =
  | "pix"
  | "cartao-credito"
  | "cartao-debito"
  | "boleto"
  | "dinheiro"
  | "convenio"
  | "transferencia"
  | "parcelamento";

export interface PaymentRecord {
  id: string;
  patientName: string;
  patientEmail: string;
  amount: number;
  currency: "BRL" | "USD";
  method: BrazilianPaymentMethod;
  status: "success" | "processing" | "failed" | "pending";
  createdAt: Date;
  updatedAt?: Date;

  // Brazilian healthcare specific
  treatmentType?: string;
  professionalName?: string;
  invoiceNumber?: string;
  installmentInfo?: {
    current: number;
    total: number;
  };

  // Compliance tracking
  receiptUrl?: string;
  taxDocumentUrl?: string;
  lgpdConsentId?: string;
}

export interface PaymentStatusTableProps {
  // Data
  payments: PaymentRecord[];
  loading?: boolean;

  // Pagination
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;

  // Filtering & Search
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: PaymentRecord["status"] | "all";
  onStatusFilterChange?: (status: PaymentRecord["status"] | "all") => void;
  methodFilter?: BrazilianPaymentMethod | "all";
  onMethodFilterChange?: (method: BrazilianPaymentMethod | "all") => void;

  // Actions
  onPaymentView?: (payment: PaymentRecord) => void;
  onPaymentRefund?: (payment: PaymentRecord) => void;
  onExportData?: () => void;

  // Customization
  variant?: "default" | "compact" | "detailed";
  showFilters?: boolean;
  showExport?: boolean;
  className?: string;
}

// Status configuration (NEONPRO theme colors)
const STATUS_CONFIG = {
  success: {
    label: "Pago",
    icon: CheckCircle,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  processing: {
    label: "Processando",
    icon: Clock,
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
  },
  failed: {
    label: "Falhou",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  pending: {
    label: "Pendente",
    icon: AlertCircle,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-500",
  },
} as const;

// Payment method labels (Portuguese)
const PAYMENT_METHOD_LABELS = {
  pix: "PIX",
  "cartao-credito": "Cartão Crédito",
  "cartao-debito": "Cartão Débito",
  boleto: "Boleto",
  dinheiro: "Dinheiro",
  convenio: "Convênio",
  transferencia: "Transferência",
  parcelamento: "Parcelamento",
} as const;

// Status badge component
const StatusBadge: React.FC<{ status: PaymentRecord["status"]; }> = ({
  status,
}) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-sm font-medium border",
        config.bg,
        config.text,
        config.border,
      )}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
    </div>
  );
};

// Payment method badge
const PaymentMethodBadge: React.FC<{ method: BrazilianPaymentMethod; }> = ({
  method,
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
      <CreditCard className="w-3.5 h-3.5" />
      <span>{PAYMENT_METHOD_LABELS[method]}</span>
    </div>
  );
};

// Format Brazilian currency
const formatBRL = (amount: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

// Format date in Brazilian format
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Email masking for privacy (NEONPRO style)
const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return email;
  }

  const masked = local.charAt(0)
    + "*".repeat(local.length - 2)
    + local.charAt(local.length - 1);
  return `${masked}@${domain}`;
};

// Table row component
const PaymentRow: React.FC<{
  payment: PaymentRecord;
  variant: "default" | "compact" | "detailed";
  onView?: (payment: PaymentRecord) => void;
  onRefund?: (payment: PaymentRecord) => void;
}> = ({ payment, variant, onView, onRefund }) => {
  const isCompact = variant === "compact";
  const isDetailed = variant === "detailed";

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Patient Info */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{payment.patientName}</div>
          {!isCompact && (
            <div className="text-sm text-gray-500">
              {maskEmail(payment.patientEmail)}
            </div>
          )}
        </div>
      </td>

      {/* Amount */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">
            {formatBRL(payment.amount)}
          </div>
          {isDetailed && payment.installmentInfo && (
            <div className="text-xs text-gray-500">
              {payment.installmentInfo.current}/{payment.installmentInfo.total} parcelas
            </div>
          )}
        </div>
      </td>

      {/* Payment Method */}
      <td className="px-4 py-3">
        <PaymentMethodBadge method={payment.method} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={payment.status} />
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-sm text-gray-600">
        {formatDate(payment.createdAt)}
      </td>

      {/* Treatment (if detailed) */}
      {isDetailed && (
        <td className="px-4 py-3">
          <div className="space-y-1">
            {payment.treatmentType && (
              <div className="text-sm font-medium text-gray-700">
                {payment.treatmentType}
              </div>
            )}
            {payment.professionalName && (
              <div className="text-xs text-gray-500">
                Dr. {payment.professionalName}
              </div>
            )}
          </div>
        </td>
      )}

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView?.(payment)}
            className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>

          {payment.status === "success" && onRefund && (
            <button
              onClick={() => onRefund(payment)}
              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-600"
              title="Solicitar reembolso"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const PaymentStatusTable: React.FC<PaymentStatusTableProps> = ({
  payments,
  loading = false,
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 10,
  onPageChange,
  searchQuery = "",
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  methodFilter = "all",
  onMethodFilterChange,
  onPaymentView,
  onPaymentRefund,
  onExportData,
  variant = "default",
  showFilters = true,
  showExport = true,
  className,
}) => {
  // Filter and search payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch = !searchQuery
        || payment.patientName.toLowerCase().includes(searchQuery.toLowerCase())
        || payment.patientEmail
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
        || payment.invoiceNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
      const matchesMethod = methodFilter === "all" || payment.method === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchQuery, statusFilter, methodFilter]);

  // Status summary
  const statusSummary = useMemo(() => {
    const summary = {
      success: 0,
      processing: 0,
      failed: 0,
      pending: 0,
      total: filteredPayments.length,
    };

    filteredPayments.forEach((payment) => {
      summary[payment.status]++;
    });

    return summary;
  }, [filteredPayments]);

  return (
    <div
      className={cn("bg-white rounded-xl border border-gray-200", className)}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pagamentos</h3>

          {showExport && (
            <button
              onClick={onExportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          )}
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {Object.entries(statusSummary).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2 text-sm">
              {status !== "total"
                ? (
                  <>
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].dot,
                      )}
                    />
                    <span className="text-gray-600">
                      {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}:
                    </span>
                  </>
                )
                : <span className="text-gray-600 font-medium">Total:</span>}
              <span className="font-semibold text-gray-900">{count}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar paciente, email ou fatura..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onStatusFilterChange?.(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onMethodFilterChange?.(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Formas</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([method, label]) => (
                <option key={method} value={method}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Paciente
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Valor
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Forma Pagamento
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Data
              </th>
              {variant === "detailed" && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Tratamento
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? (
                <tr>
                  <td
                    colSpan={variant === "detailed" ? 7 : 6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Carregando pagamentos...
                  </td>
                </tr>
              )
              : filteredPayments.length === 0
              ? (
                <tr>
                  <td
                    colSpan={variant === "detailed" ? 7 : 6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Nenhum pagamento encontrado
                  </td>
                </tr>
              )
              : (
                filteredPayments.map((payment) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    variant={variant}
                    onView={onPaymentView}
                    onRefund={onPaymentRefund}
                  />
                ))
              )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages} • {filteredPayments.length} resultados
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatusTable;
