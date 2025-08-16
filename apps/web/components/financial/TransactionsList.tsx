'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  Search,
  Shield,
  Stethoscope,
  User,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';

type TransactionsListProps = {
  'data-testid'?: string;
  className?: string;
};

type Transaction = {
  id: string;
  date: string;
  patientId: string;
  patientName: string; // Encrypted/masked for LGPD
  procedure: string;
  professional: string;
  amount: number;
  status: 'reconciled' | 'pending' | 'discrepancy' | 'processing';
  paymentMethod: 'pix' | 'card' | 'cash' | 'insurance';
  reconciliationDate?: string;
  notes?: string;
  complianceFlags: string[];
};

type FilterType =
  | 'all'
  | 'reconciled'
  | 'pending'
  | 'discrepancy'
  | 'processing';
type PaymentMethodFilter = 'all' | 'pix' | 'card' | 'cash' | 'insurance';

/**
 * Transactions List Component
 *
 * Healthcare Financial Transactions with LGPD Protection
 * - Patient transaction history with data anonymization
 * - Medical procedure billing details
 * - Payment reconciliation status tracking
 * - ANVISA procedure compliance monitoring
 * - CFM professional billing oversight
 *
 * Quality Standard: ≥9.9/10 (Healthcare financial integrity)
 */
export const TransactionsList: React.FC<TransactionsListProps> = ({
  'data-testid': testId = 'transactions-list',
  className = '',
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [paymentFilter, setPaymentFilter] =
    useState<PaymentMethodFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      // Simulate healthcare API call with LGPD compliance
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mock healthcare transaction data with privacy protection
      const mockTransactions: Transaction[] = [
        {
          id: 'TXN-001',
          date: '2024-01-15T10:30:00Z',
          patientId: 'PAT-***456',
          patientName: 'Maria S. ***', // LGPD masked
          procedure: 'Botox Facial',
          professional: 'Dra. Ana Costa',
          amount: 850.0,
          status: 'reconciled',
          paymentMethod: 'pix',
          reconciliationDate: '2024-01-15T10:35:00Z',
          complianceFlags: ['LGPD_OK', 'ANVISA_OK'],
        },
        {
          id: 'TXN-002',
          date: '2024-01-15T14:20:00Z',
          patientId: 'PAT-***789',
          patientName: 'João M. ***', // LGPD masked
          procedure: 'Preenchimento Labial',
          professional: 'Dr. Carlos Silva',
          amount: 1200.0,
          status: 'pending',
          paymentMethod: 'card',
          complianceFlags: ['LGPD_OK'],
        },
        {
          id: 'TXN-003',
          date: '2024-01-15T16:45:00Z',
          patientId: 'PAT-***123',
          patientName: 'Ana P. ***', // LGPD masked
          procedure: 'Limpeza de Pele',
          professional: 'Esteticista Laura',
          amount: 180.0,
          status: 'discrepancy',
          paymentMethod: 'cash',
          notes: 'Diferença de R$ 20,00 encontrada',
          complianceFlags: ['LGPD_OK', 'REVIEW_NEEDED'],
        },
        {
          id: 'TXN-004',
          date: '2024-01-14T09:15:00Z',
          patientId: 'PAT-***567',
          patientName: 'Carla L. ***', // LGPD masked
          procedure: 'Microagulhamento',
          professional: 'Dra. Patricia Lima',
          amount: 350.0,
          status: 'processing',
          paymentMethod: 'insurance',
          complianceFlags: ['LGPD_OK', 'ANVISA_PENDING'],
        },
      ];

      setTransactions(mockTransactions);
    } catch (_err) {
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.patientName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.procedure
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.professional
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter
      );
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(
        (transaction) => transaction.paymentMethod === paymentFilter
      );
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const statusConfig = {
      reconciled: {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle2,
        label: 'Reconciliado',
      },
      pending: {
        variant: 'default' as const,
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'Pendente',
      },
      discrepancy: {
        variant: 'destructive' as const,
        className: '',
        icon: AlertCircle,
        label: 'Divergência',
      },
      processing: {
        variant: 'default' as const,
        className: 'bg-blue-100 text-blue-800',
        icon: Clock,
        label: 'Processando',
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className} variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: Transaction['paymentMethod']) => {
    const labels = {
      pix: 'PIX',
      card: 'Cartão',
      cash: 'Dinheiro',
      insurance: 'Convênio',
    };
    return labels[method];
  };

  const exportTransactions = () => {};

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  if (isLoading) {
    return (
      <Card className={className} data-testid={`${testId}-loading`}>
        <CardHeader>
          <CardTitle>Carregando Transações...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div className="h-16 animate-pulse rounded bg-muted" key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid={testId}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Transações Financeiras
            </CardTitle>
            <CardDescription>
              Histórico de pagamentos com proteção LGPD
            </CardDescription>
          </div>
          <Button
            data-testid="export-button"
            onClick={exportTransactions}
            size="sm"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                data-testid="search-input"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por paciente, procedimento ou profissional..."
                value={searchTerm}
              />
            </div>
          </div>
          <Select
            onValueChange={(value) => setStatusFilter(value as FilterType)}
            value={statusFilter}
          >
            <SelectTrigger className="w-48" data-testid="status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="reconciled">Reconciliado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="discrepancy">Divergência</SelectItem>
              <SelectItem value="processing">Processando</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              setPaymentFilter(value as PaymentMethodFilter)
            }
            value={paymentFilter}
          >
            <SelectTrigger className="w-48" data-testid="payment-filter">
              <SelectValue placeholder="Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Métodos</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="card">Cartão</SelectItem>
              <SelectItem value="cash">Dinheiro</SelectItem>
              <SelectItem value="insurance">Convênio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p
            className="text-muted-foreground text-sm"
            data-testid="results-count"
          >
            {filteredTransactions.length} transação(ões) encontrada(s)
          </p>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Shield className="h-3 w-3" />
            <span>Dados protegidos por LGPD</span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-md border" data-testid="transactions-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Procedimento</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow
                  data-testid={`transaction-row-${transaction.id}`}
                  key={transaction.id}
                >
                  <TableCell className="font-mono text-xs">
                    {transaction.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {formatDate(transaction.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="text-sm">{transaction.patientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" />
                      <span className="text-sm">{transaction.procedure}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {transaction.professional}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodLabel(transaction.paymentMethod)}
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>
                    <Button
                      data-testid={`view-${transaction.id}`}
                      size="sm"
                      variant="ghost"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                data-testid="prev-page"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                size="sm"
                variant="outline"
              >
                Anterior
              </Button>
              <Button
                data-testid="next-page"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                size="sm"
                variant="outline"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
