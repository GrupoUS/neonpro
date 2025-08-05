"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer, useCRM } from "@/contexts/crm-context";
import type { formatCurrency, formatDate } from "@/lib/utils";
import type { Download, MoreHorizontal, Plus, Search } from "lucide-react";
import type { useEffect, useState } from "react";

interface CustomerListProps {
  onCustomerSelect?: (customer: Customer) => void;
  onCreateCustomer?: () => void;
  onEditCustomer?: (customer: Customer) => void;
}

export default function CustomerList({
  onCustomerSelect,
  onCreateCustomer,
  onEditCustomer,
}: CustomerListProps) {
  const {
    state,
    dispatch,
    filteredCustomers,
    totalCustomers,
    activeCustomers,
    vipCustomers,
    setFilter,
    resetFilters,
    setLoading,
    setError,
  } = useCRM();

  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // Mock data for development - will be replaced with real data
  useEffect(() => {
    const loadCustomers = async () => {
      setLoading("customers", true);
      setError("customers", undefined);

      try {
        // Mock data - replace with actual Supabase query
        const mockCustomers: Customer[] = [
          {
            id: "1",
            profile_id: "profile-1",
            profile: {
              full_name: "Ana Silva Santos",
              email: "ana.silva@email.com",
              phone: "(11) 99999-1234",
            },
            customer_since: "2024-01-15",
            lifetime_value: 3450.0,
            last_treatment: "2024-12-20",
            last_visit: "2024-12-20",
            total_visits: 8,
            preferred_contact_method: "whatsapp",
            notes: "Prefere horários pela manhã. Alérgica a produtos com parabenos.",
            tags: ["vip", "fidelizada"],
            status: "vip",
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-12-20T15:30:00Z",
          },
          {
            id: "2",
            profile_id: "profile-2",
            profile: {
              full_name: "Maria Oliveira Costa",
              email: "maria.costa@email.com",
              phone: "(11) 98888-5678",
            },
            customer_since: "2024-06-10",
            lifetime_value: 1250.0,
            last_treatment: "2024-11-15",
            last_visit: "2024-11-15",
            total_visits: 4,
            preferred_contact_method: "email",
            notes: "Interessada em tratamentos anti-idade.",
            tags: ["regular"],
            status: "active",
            created_at: "2024-06-10T14:00:00Z",
            updated_at: "2024-11-15T16:45:00Z",
          },
          {
            id: "3",
            profile_id: "profile-3",
            profile: {
              full_name: "Juliana Ferreira Lima",
              email: "juliana.lima@email.com",
              phone: "(11) 97777-9012",
            },
            customer_since: "2024-03-22",
            lifetime_value: 850.0,
            last_treatment: "2024-08-30",
            last_visit: "2024-08-30",
            total_visits: 2,
            preferred_contact_method: "phone",
            notes: "Cliente nova, ainda experimentando os serviços.",
            tags: ["nova"],
            status: "inactive",
            created_at: "2024-03-22T09:30:00Z",
            updated_at: "2024-08-30T11:20:00Z",
          },
          {
            id: "4",
            profile_id: "profile-4",
            profile: {
              full_name: "Carla Mendes Souza",
              email: "carla.souza@email.com",
              phone: "(11) 96666-3456",
            },
            customer_since: "2023-11-08",
            lifetime_value: 5200.0,
            last_treatment: "2024-12-18",
            last_visit: "2024-12-18",
            total_visits: 15,
            preferred_contact_method: "whatsapp",
            notes: "Cliente fidelíssima, sempre indica amigas.",
            tags: ["vip", "embaixadora"],
            status: "vip",
            created_at: "2023-11-08T16:15:00Z",
            updated_at: "2024-12-18T14:00:00Z",
          },
        ];

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // In real app, this would be:
        // const { data: customers, error } = await supabase
        //   .from('customers')
        //   .select(`
        //     *,
        //     profile:profiles(full_name, email, phone)
        //   `)
        //   .eq('profiles.clinic_id', userClinicId);

        // if (error) throw error;

        // For now, dispatch mock data
        dispatch({ type: "SET_CUSTOMERS", payload: mockCustomers });
      } catch (error) {
        console.error("Error loading customers:", error);
        setError("customers", "Erro ao carregar clientes. Tente novamente.");
      } finally {
        setLoading("customers", false);
      }
    };

    loadCustomers();
  }, [setLoading, setError, dispatch]);

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((c) => c.id));
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers((prev) => prev.filter((id) => id !== customerId));
    } else {
      setSelectedCustomers((prev) => [...prev, customerId]);
    }
  };

  const getStatusBadge = (status: Customer["status"]) => {
    const variants = {
      active: { variant: "default" as const, label: "Ativo" },
      vip: { variant: "secondary" as const, label: "VIP" },
      inactive: { variant: "outline" as const, label: "Inativo" },
      blocked: { variant: "destructive" as const, label: "Bloqueado" },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleExportCustomers = () => {
    // Create CSV content
    const headers = [
      "Nome",
      "Email",
      "Telefone",
      "Status",
      "Valor Total",
      "Última Visita",
      "Total de Visitas",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredCustomers.map((customer) =>
        [
          customer.profile?.full_name || "",
          customer.profile?.email || "",
          customer.profile?.phone || "",
          customer.status,
          customer.lifetime_value.toString(),
          customer.last_visit ? formatDate(customer.last_visit) : "",
          customer.total_visits.toString(),
        ].join(","),
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `clientes-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (state.loading.customers) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando clientes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state.errors.customers) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{state.errors.customers}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                👥
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold">{activeCustomers}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                ✅
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes VIP</p>
                <p className="text-2xl font-bold">{vipCustomers}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                ⭐
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Clientes</CardTitle>

            <div className="flex items-center gap-2">
              <Button onClick={handleExportCustomers} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              {onCreateCustomer && (
                <Button onClick={onCreateCustomer} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={state.filters.customer_search}
                onChange={(e) => setFilter("customer_search", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={state.filters.customer_status}
              onValueChange={(value) => setFilter("customer_status", value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>

            {(state.filters.customer_search || state.filters.customer_status) && (
              <Button onClick={resetFilters} variant="outline" size="sm">
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedCustomers.length === filteredCustomers.length &&
                        filteredCustomers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead>Visitas</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {state.filters.customer_search || state.filters.customer_status ? (
                          <>Nenhum cliente encontrado com os filtros aplicados.</>
                        ) : (
                          <>Nenhum cliente cadastrado ainda.</>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onCustomerSelect?.(customer)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleSelectCustomer(customer.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{customer.profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{customer.profile?.email}</p>
                          <p className="text-sm text-muted-foreground">{customer.profile?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(customer.lifetime_value)}
                      </TableCell>
                      <TableCell>
                        {customer.last_visit ? formatDate(customer.last_visit) : "-"}
                      </TableCell>
                      <TableCell>{customer.total_visits}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onCustomerSelect?.(customer)}>
                              Ver Detalhes
                            </DropdownMenuItem>
                            {onEditCustomer && (
                              <DropdownMenuItem onClick={() => onEditCustomer(customer)}>
                                Editar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Selected customers actions */}
      {selectedCustomers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-4">
            <span>{selectedCustomers.length} cliente(s) selecionado(s)</span>
            <Button size="sm" variant="secondary">
              Criar Campanha
            </Button>
            <Button size="sm" variant="secondary">
              Exportar Selecionados
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
