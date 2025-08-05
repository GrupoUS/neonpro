"use client";

import type {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Filter,
  PieChart,
  Receipt,
  Search,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { useEffect, useState } from "react";
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
import type { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Progress } from "@/components/ui/progress";
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
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  consultationRevenue: number;
  procedureRevenue: number;
  insurancePayments: number;
  privatePayments: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

interface Transaction {
  id: string;
  date: string;
  patientName: string;
  description: string;
  type: "receita" | "despesa";
  category: "consulta" | "procedimento" | "medicamento" | "equipamento" | "salario" | "aluguel";
  amount: number;
  paymentMethod: "dinheiro" | "cartao" | "pix" | "convenio" | "transferencia";
  status: "pago" | "pendente" | "vencido" | "cancelado";
  dueDate?: string;
  paymentDate?: string;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  consultations: number;
}

export default function FinancialPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    consultationRevenue: 0,
    procedureRevenue: 0,
    insurancePayments: 0,
    privatePayments: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const loadFinancialData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStats({
        totalRevenue: 284350,
        monthlyRevenue: 85420,
        pendingPayments: 12450,
        overduePayments: 3200,
        consultationRevenue: 68900,
        procedureRevenue: 16520,
        insurancePayments: 52800,
        privatePayments: 32620,
        totalExpenses: 45200,
        netProfit: 40220,
        profitMargin: 47.1,
      });

      setTransactions([
        {
          id: "1",
          date: "2024-08-05",
          patientName: "Ana Silva Santos",
          description: "Consulta Cardiologia",
          type: "receita",
          category: "consulta",
          amount: 280,
          paymentMethod: "convenio",
          status: "pago",
          paymentDate: "2024-08-05",
        },
        {
          id: "2",
          date: "2024-08-05",
          patientName: "Carlos Rodrigues",
          description: "Exame Laboratorial",
          type: "receita",
          category: "procedimento",
          amount: 150,
          paymentMethod: "cartao",
          status: "pago",
          paymentDate: "2024-08-05",
        },
        {
          id: "3",
          date: "2024-08-04",
          patientName: "Maria Oliveira",
          description: "Consulta Geral",
          type: "receita",
          category: "consulta",
          amount: 200,
          paymentMethod: "pix",
          status: "pendente",
          dueDate: "2024-08-10",
        },
        {
          id: "4",
          date: "2024-08-03",
          patientName: "João Ferreira",
          description: "Procedimento Cirúrgico",
          type: "receita",
          category: "procedimento",
          amount: 1200,
          paymentMethod: "convenio",
          status: "pago",
          paymentDate: "2024-08-03",
        },
        {
          id: "5",
          date: "2024-08-01",
          patientName: "Fornecedor XYZ",
          description: "Equipamentos Médicos",
          type: "despesa",
          category: "equipamento",
          amount: 2500,
          paymentMethod: "transferencia",
          status: "pago",
          paymentDate: "2024-08-01",
        },
      ]);

      setMonthlyData([
        { month: "Jan", revenue: 72500, expenses: 38200, profit: 34300, consultations: 156 },
        { month: "Fev", revenue: 68900, expenses: 39800, profit: 29100, consultations: 142 },
        { month: "Mar", revenue: 79200, expenses: 41500, profit: 37700, consultations: 168 },
        { month: "Abr", revenue: 83100, expenses: 43200, profit: 39900, consultations: 174 },
        { month: "Mai", revenue: 85420, expenses: 45200, profit: 40220, consultations: 181 },
      ]);

      setIsLoading(false);
    };

    loadFinancialData();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-100 text-green-800 border-green-200";
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "vencido":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelado":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cartao":
        return <CreditCard className="w-4 h-4" />;
      case "pix":
        return <DollarSign className="w-4 h-4" />;
      case "dinheiro":
        return <Receipt className="w-4 h-4" />;
      case "convenio":
        return <FileText className="w-4 h-4" />;
      case "transferencia":
        return <ArrowUpRight className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner className="w-8 h-8 mx-auto" />
          <p className="text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }
  return (
    <main className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Relatórios Financeiros
          </h1>
          <p className="text-muted-foreground">
            Gestão financeira e análise de receitas da clínica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">Este Mês</SelectItem>
              <SelectItem value="last-month">Mês Anterior</SelectItem>
              <SelectItem value="this-year">Este Ano</SelectItem>
              <SelectItem value="custom">Período Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-neon-500 hover:bg-neon-600">
            <FileText className="w-4 h-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +12.5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Margem: {stats.profitMargin}%</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats.pendingPayments)}
            </div>
            <p className="text-xs text-muted-foreground">12 faturas pendentes</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.overduePayments)}
            </div>
            <p className="text-xs text-muted-foreground">3 faturas vencidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-neon-500" />
              Distribuição de Receita
            </CardTitle>
            <CardDescription>Breakdown por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Consultas</span>
                <span className="font-medium">{formatCurrency(stats.consultationRevenue)}</span>
              </div>
              <Progress value={80} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">80% da receita total</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Procedimentos</span>
                <span className="font-medium">{formatCurrency(stats.procedureRevenue)}</span>
              </div>
              <Progress value={20} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">20% da receita total</p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm mb-2">
                <span>Convênios</span>
                <span className="font-medium">{formatCurrency(stats.insurancePayments)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Particular</span>
                <span className="font-medium">{formatCurrency(stats.privatePayments)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-neon-500" />
              Evolução Mensal
            </CardTitle>
            <CardDescription>Receita vs Despesas dos últimos 5 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Placeholder for chart */}
              <div className="w-full h-full bg-gradient-to-br from-neon-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-neon-200">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-neon-500" />
                  <p className="text-lg font-medium text-neon-700">
                    Gráfico de Receita vs Despesas
                  </p>
                  <div className="mt-4 space-y-2">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{data.month}</span>
                        <span className="text-green-600">{formatCurrency(data.revenue)}</span>
                        <span className="text-red-600">{formatCurrency(data.expenses)}</span>
                        <span className="text-blue-600 font-medium">
                          {formatCurrency(data.profit)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-neon-500" />
                Transações Recentes
              </CardTitle>
              <CardDescription>Histórico de receitas e despesas</CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[200px]"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Paciente/Fornecedor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell>{new Date(transaction.date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="font-medium">{transaction.patientName}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          transaction.type === "receita"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {transaction.type === "receita" ? (
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 mr-1" />
                        )}
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="ml-2 capitalize">
                          {transaction.paymentMethod.replace("-", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          transaction.type === "receita"
                            ? "font-medium text-green-600"
                            : "font-medium text-red-600"
                        }
                      >
                        {transaction.type === "receita" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(transaction.status)}>
                        {transaction.status === "pago" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {transaction.status === "pendente" && <Clock className="w-3 h-3 mr-1" />}
                        {transaction.status === "vencido" && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {transaction.status === "cancelado" && <XCircle className="w-3 h-3 mr-1" />}
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-neon-600 hover:bg-neon-50"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
