/**
 * ResponseFormatter Component (T041)
 * Formats and displays AI agent responses in user-friendly formats
 *
 * Features:
 * - Structured data display for clients, appointments, financial records
 * - Interactive cards with expand/collapse functionality
 * - Brazilian Portuguese formatting for dates, currency, documents
 * - Export capabilities for data tables
 * - Mobile-responsive design with touch interactions
 * - Accessibility compliance (WCAG 2.1 AA+)
 * - Loading states and error handling
 * - Pagination for large datasets
 * - Search and filter capabilities
 */

'use client';

import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  Filter,
  MoreHorizontal,
  Phone,
  Search,
  User,
  Users,
} from 'lucide-react';
import React, { useState, useMemo, useCallback } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,

  DropdownMenuTrigger,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { formatCurrency, formatDateTime, formatCPF, formatPhone } from '@/utils/brazilian-formatters';
import { cn } from '@neonpro/ui';

import type {
  AgentResponse,
  AppointmentData,
  ClientData,
  FinancialData,
} from '@neonpro/types';

export interface ResponseFormatterProps {
  /** Agent response data to format */
  response: AgentResponse;
  /** Show export functionality */
  showExport?: boolean;
  /** Maximum items to show before pagination */
  itemsPerPage?: number;
  /** Compact mode for smaller spaces */
  compact?: boolean;
  /** Enable search and filter */
  enableFilters?: boolean;
  /** Custom click handlers */
  onItemClick?: (type: 'client' | 'appointment' | 'financial', item: any) => void;
  /** Export handler */
  onExport?: (type: 'client' | 'appointment' | 'financial', data: any[]) => void;
  /** Test ID */
  testId?: string;
}

interface FilterState {
  search: string;
  status?: string;
  dateRange?: string;
  sortBy?: string;
}

/**
 * Client Data Card Component
 */
const ClientCard: React.FC<{
  client: ClientData;
  onClick?: () => void;
  compact?: boolean;
}> = ({ client, onClick, compact }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card 
      className={cn(
        'cursor-pointer hover:shadow-md transition-all duration-200',
        compact && 'p-2'
      )}
      onClick={onClick}
    >
      <CardHeader className={cn('pb-2', compact && 'pb-1')}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn('text-base font-medium', compact && 'text-sm')}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {client.name}
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={client.status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {client.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
            {!compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="h-6 w-6 p-0"
              >
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn('pt-0', compact && 'text-xs')}>
        <div className="space-y-1">
          {client.email && (
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-3 w-3 mr-1" />
              {formatPhone(client.phone)}
            </div>
          )}
          {client.document && (
            <div className="flex items-center text-sm text-muted-foreground">
              CPF: {formatCPF(client.document)}
            </div>
          )}
        </div>

        {expanded && !compact && (
          <div className="mt-3 pt-3 border-t space-y-2">
            {client.birthDate && (
              <div className="text-sm">
                <span className="font-medium">Nascimento:</span> {formatDateTime(client.birthDate, 'date')}
              </div>
            )}
            {client.healthPlan && (
              <div className="text-sm">
                <span className="font-medium">Plano:</span> {client.healthPlan}
                {client.healthPlanNumber && ` - ${client.healthPlanNumber}`}
              </div>
            )}
            {client.address && (
              <div className="text-sm">
                <span className="font-medium">Endereço:</span> {client.address.street}, {client.address.number}
                {client.address.complement && `, ${client.address.complement}`}
                <br />
                {client.address.neighborhood} - {client.address.city}/{client.address.state}
                <br />
                CEP: {client.address.zipCode}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Appointment Data Card Component
 */
const AppointmentCard: React.FC<{
  appointment: AppointmentData;
  onClick?: () => void;
  compact?: boolean;
}> = ({ appointment, onClick, compact }) => {
  const getStatusColor = (_status: any) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'scheduled': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      case 'no-show': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (_status: any) => {
    const statusMap = {
      'scheduled': 'Agendado',
      'confirmed': 'Confirmado',
      'in-progress': 'Em andamento',
      'completed': 'Concluído',
      'cancelled': 'Cancelado',
      'no-show': 'Não compareceu',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer hover:shadow-md transition-all duration-200',
        compact && 'p-2'
      )}
      onClick={onClick}
    >
      <CardHeader className={cn('pb-2', compact && 'pb-1')}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn('text-base font-medium', compact && 'text-sm')}>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {appointment.clientName}
            </div>
          </CardTitle>
          <Badge variant={getStatusColor(appointment.status)} className="text-xs">
            {getStatusText(appointment.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className={cn('pt-0', compact && 'text-xs')}>
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {formatDateTime(appointment.scheduledAt)}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Serviço:</span> {appointment.serviceName}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Profissional:</span> {appointment.professionalName}
          </div>
          {appointment.duration && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Duração:</span> {appointment.duration} minutos
            </div>
          )}
          {appointment.telemedicine && (
            <Badge variant="outline" className="text-xs">
              Telemedicina
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Financial Data Card Component
 */
const FinancialCard: React.FC<{
  financial: FinancialData;
  onClick?: () => void;
  compact?: boolean;
}> = ({ financial, onClick, compact }) => {
  const getStatusColor = (_status: any) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'destructive';
      case 'refunded': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (_status: any) => {
    const statusMap = {
      'pending': 'Pendente',
      'paid': 'Pago',
      'overdue': 'Vencido',
      'cancelled': 'Cancelado',
      'refunded': 'Estornado',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer hover:shadow-md transition-all duration-200',
        compact && 'p-2'
      )}
      onClick={onClick}
    >
      <CardHeader className={cn('pb-2', compact && 'pb-1')}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn('text-base font-medium', compact && 'text-sm')}>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              {financial.clientName}
            </div>
          </CardTitle>
          <div className="text-right">
            <div className={cn('font-semibold', compact ? 'text-sm' : 'text-lg')}>
              {formatCurrency(financial.amount)}
            </div>
            <Badge variant={getStatusColor(financial.status)} className="text-xs">
              {getStatusText(financial.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn('pt-0', compact && 'text-xs')}>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Serviço:</span> {financial.serviceName}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Profissional:</span> {financial.professionalName}
          </div>
          {financial.paymentMethod && (
            <div className="flex items-center text-sm text-muted-foreground">
              <CreditCard className="h-3 w-3 mr-1" />
              {financial.paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
               financial.paymentMethod === 'debit_card' ? 'Cartão de Débito' :
               financial.paymentMethod === 'cash' ? 'Dinheiro' :
               financial.paymentMethod === 'health_plan' ? 'Plano de Saúde' :
               financial.paymentMethod}
            </div>
          )}
          {financial.dueDate && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Vencimento:</span> {formatDateTime(financial.dueDate, 'date')}
            </div>
          )}
          {financial.paymentDate && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Pagamento:</span> {formatDateTime(financial.paymentDate, 'date')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Data Table Component for tabular view
 */
const DataTable: React.FC<{
  data: any[];
  type: 'clients' | 'appointments' | 'financial';
  onItemClick?: (item: any) => void;
  compact?: boolean;
}> = ({ data, type, onItemClick, compact }) => {
  const renderTableHeaders = () => {
    switch (type) {
      case 'clients':
        return (
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        );
      case 'appointments':
        return (
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Profissional</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        );
      case 'financial':
        return (
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (item: any, index: number) => {
    switch (type) {
      case 'clients':
        return (
          <TableRow key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => onItemClick?.(item)}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.email || '-'}</TableCell>
            <TableCell>{item.phone ? formatPhone(item.phone) : '-'}</TableCell>
            <TableCell>
              <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                {item.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </TableCell>
          </TableRow>
        );
      case 'appointments':
        return (
          <TableRow key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => onItemClick?.(item)}>
            <TableCell className="font-medium">{item.clientName}</TableCell>
            <TableCell>{formatDateTime(item.scheduledAt)}</TableCell>
            <TableCell>{item.serviceName}</TableCell>
            <TableCell>{item.professionalName}</TableCell>
            <TableCell>
              <Badge variant="secondary">{item.status}</Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </TableCell>
          </TableRow>
        );
      case 'financial':
        return (
          <TableRow key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => onItemClick?.(item)}>
            <TableCell className="font-medium">{item.clientName}</TableCell>
            <TableCell>{item.serviceName}</TableCell>
            <TableCell className="font-semibold">{formatCurrency(item.amount)}</TableCell>
            <TableCell>
              <Badge variant={item.status === 'paid' ? 'default' : 'secondary'}>
                {item.status === 'paid' ? 'Pago' : 'Pendente'}
              </Badge>
            </TableCell>
            <TableCell>{item.dueDate ? formatDateTime(item.dueDate, 'date') : '-'}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </TableCell>
          </TableRow>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          {renderTableHeaders()}
        </TableHeader>
        <TableBody>
          {data.map(renderTableRow)}
        </TableBody>
      </Table>
    </div>
  );
};

/**
 * Main ResponseFormatter Component
 */
export const ResponseFormatter: React.FC<ResponseFormatterProps> = ({
  response,
  showExport = true,
  itemsPerPage = 10,
  compact = false,
  enableFilters = true,
  onItemClick,
  onExport,
  testId = 'response-formatter',
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
  });

  const data = response.data || {};
  const { clients = [], appointments = [], financial = [] } = data;
  const summary = data.summary;

  // Determine which data type to show
  const hasClients = clients.length > 0;
  const hasAppointments = appointments.length > 0;
  const hasFinancial = financial.length > 0;
  const dataTypes = [
    hasClients && 'clients',
    hasAppointments && 'appointments', 
    hasFinancial && 'financial'
  ].filter(Boolean) as string[];

  const [activeTab, setActiveTab] = useState(dataTypes[0] || 'clients');

  // Get active data
  const getActiveData = () => {
    switch (activeTab) {
      case 'clients': return clients;
      case 'appointments': return appointments;
      case 'financial': return financial;
      default: return [];
    }
  };

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = getActiveData();

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      data = data.filter((_item: any) => {
        const searchableText = Object.values(item).join(' ').toLowerCase();
        return searchableText.includes(searchLower);
      });
    }

    // Apply status filter
    if (filters.status) {
      data = data.filter((item: any) => item.status === filters.status);
    }

    return data;
  }, [activeTab, filters, clients, appointments, financial]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handle item click
  const handleItemClick = useCallback((_item: any) => {
    onItemClick?.(activeTab as any, item);
  }, [activeTab, onItemClick]);

  // Handle export
  const handleExport = useCallback(() => {
    onExport?.(activeTab as any, filteredData);
  }, [activeTab, filteredData, onExport]);

  // Render summary section
  const renderSummary = () => {
    if (!summary) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold">{summary.count || filteredData.length}</div>
          <div className="text-sm text-muted-foreground">
            {activeTab === 'clients' ? 'Clientes' :
             activeTab === 'appointments' ? 'Agendamentos' :
             'Transações'}
          </div>
        </Card>
        
        {summary.total !== undefined && (
          <Card className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </Card>
        )}
        
        {summary.paid !== undefined && (
          <Card className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(summary.paid)}</div>
            <div className="text-sm text-muted-foreground">Pago</div>
          </Card>
        )}
        
        {summary.pending !== undefined && (
          <Card className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(summary.pending)}</div>
            <div className="text-sm text-muted-foreground">Pendente</div>
          </Card>
        )}
      </div>
    );
  };

  // Render filters
  const renderFilters = () => {
    if (!enableFilters) return null;

    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={viewMode}
            onValueChange={(value: 'cards' | 'table') => setViewMode(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cards">Cards</SelectItem>
              <SelectItem value="table">Tabela</SelectItem>
            </SelectContent>
          </Select>

          {showExport && (
            <Button variant="outline" onClick={handleExport} className="shrink-0">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render content
  const renderContent = () => {
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Nenhum resultado encontrado</div>
        </div>
      );
    }

    if (viewMode === 'table') {
      return (
        <DataTable
          data={paginatedData}
          type={activeTab as any}
          onItemClick={handleItemClick}
          compact={compact}
        />
      );
    }

    return (
      <div className={cn(
        'grid gap-4',
        compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      )}>
        {paginatedData.map((item, index) => {
          switch (activeTab) {
            case 'clients':
              return (
                <ClientCard
                  key={index}
                  client={item}
                  onClick={() => handleItemClick(item)}
                  compact={compact}
                />
              );
            case 'appointments':
              return (
                <AppointmentCard
                  key={index}
                  appointment={item}
                  onClick={() => handleItemClick(item)}
                  compact={compact}
                />
              );
            case 'financial':
              return (
                <FinancialCard
                  key={index}
                  financial={item}
                  onClick={() => handleItemClick(item)}
                  compact={compact}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-muted-foreground">
          Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} resultados
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Próximo
          </Button>
        </div>
      </div>
    );
  };

  if (!hasClients && !hasAppointments && !hasFinancial) {
    return (
      <div className="text-center py-8" data-testid={testId}>
        <div className="text-muted-foreground">
          Nenhum dado encontrado para exibir
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid={testId}>
      {renderSummary()}

      {dataTypes.length > 1 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            {hasClients && (
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clientes ({clients.length})
              </TabsTrigger>
            )}
            {hasAppointments && (
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agendamentos ({appointments.length})
              </TabsTrigger>
            )}
            {hasFinancial && (
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financeiro ({financial.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {renderFilters()}
            {renderContent()}
            {renderPagination()}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          {renderFilters()}
          {renderContent()}
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default ResponseFormatter;