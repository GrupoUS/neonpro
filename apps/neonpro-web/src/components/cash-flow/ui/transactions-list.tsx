// Transactions List - Display and manage cash flow transactions
// Following financial dashboard patterns from Context7 research

"use client";

import type { ArrowUpDown, Filter, MoreHorizontal, Search } from "lucide-react";
import type { useState } from "react";
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
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { useCashFlow } from "../hooks/use-cash-flow";
import type { useCashRegisters } from "../hooks/use-cash-registers";
import type { CashFlowEntry, CashFlowFilters } from "../types";
import type {
  formatCurrency,
  formatDateTime,
  getCategoryDisplayName,
  getPaymentMethodDisplayName,
  getPaymentMethodIcon,
  getTransactionTypeColor,
  getTransactionTypeDisplayName,
} from "../utils/calculations";

interface TransactionsListProps {
  clinicId: string;
  initialFilters?: CashFlowFilters;
}

export function TransactionsList({ clinicId, initialFilters }: TransactionsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CashFlowFilters>(initialFilters || {});

  const { registers } = useCashRegisters(clinicId);
  const { entries, loading, totalPages, currentPage, loadEntries, updateEntry, deleteEntry } =
    useCashFlow(clinicId, { ...filters, search: searchTerm });

  const handleFilterChange = (key: keyof CashFlowFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadEntries(newFilters);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    loadEntries({ ...filters, search: term });
  };

  const getRegisterName = (registerId: string) => {
    const register = registers.find((r) => r.id === registerId);
    return register?.register_name || "N/A";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transações</CardTitle>
            <CardDescription>Histórico de movimentações financeiras</CardDescription>
          </div>
          <Button size="sm">Nova Transação</Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Select
              value={filters.transactionType || ""}
              onValueChange={(value) => handleFilterChange("transactionType", value || undefined)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="receipt">Recebimento</SelectItem>
                <SelectItem value="payment">Pagamento</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="adjustment">Ajuste</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentMethod || ""}
              onValueChange={(value) => handleFilterChange("paymentMethod", value || undefined)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as formas</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="bank_transfer">Transferência</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.registerId || ""}
              onValueChange={(value) => handleFilterChange("registerId", value || undefined)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Caixa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os caixas</SelectItem>
                {registers.map((register) => (
                  <SelectItem key={register.id} value={register.id}>
                    {register.register_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>{" "}
        {/* Transactions Table */}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Data/Hora</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">Descrição</th>
                  <th className="text-left p-4 font-medium">Categoria</th>
                  <th className="text-left p-4 font-medium">Valor</th>
                  <th className="text-left p-4 font-medium">Pagamento</th>
                  <th className="text-left p-4 font-medium">Caixa</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground">
                      Carregando transações...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <TransactionRow
                      key={entry.id}
                      entry={entry}
                      registerName={getRegisterName(entry.register_id || "")}
                      onUpdate={updateEntry}
                      onDelete={deleteEntry}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => loadEntries(filters, currentPage - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => loadEntries(filters, currentPage + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TransactionRowProps {
  entry: CashFlowEntry;
  registerName: string;
  onUpdate: (id: string, updates: Partial<CashFlowEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function TransactionRow({ entry, registerName, onUpdate, onDelete }: TransactionRowProps) {
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-4">
        <div className="text-sm">{formatDateTime(entry.created_at)}</div>
      </td>
      <td className="p-4">
        <Badge variant="outline" className={getTransactionTypeColor(entry.transaction_type)}>
          {getTransactionTypeDisplayName(entry.transaction_type)}
        </Badge>
      </td>
      <td className="p-4">
        <div className="max-w-[200px] truncate">{entry.description}</div>
        {entry.reference_number && (
          <div className="text-xs text-muted-foreground">Ref: {entry.reference_number}</div>
        )}
      </td>
      <td className="p-4">
        <span className="text-sm">{getCategoryDisplayName(entry.category)}</span>
      </td>
      <td className="p-4">
        <span
          className={`font-medium ${
            ["receipt", "opening_balance"].includes(entry.transaction_type)
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {["receipt", "opening_balance"].includes(entry.transaction_type) ? "+" : "-"}
          {formatCurrency(entry.amount)}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getPaymentMethodIcon(entry.payment_method)}</span>
          <span className="text-sm">{getPaymentMethodDisplayName(entry.payment_method)}</span>
        </div>
      </td>
      <td className="p-4">
        <span className="text-sm">{registerName}</span>
      </td>
      <td className="p-4">
        <Badge variant={entry.is_reconciled ? "default" : "secondary"}>
          {entry.is_reconciled ? "Conciliado" : "Pendente"}
        </Badge>
      </td>
      <td className="p-4">
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
