"use client";

import { useState } from "react";
import {
  CreditCard,
  DollarSign,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Eye,
  Receipt,
  Banknote,
  Smartphone,
  Building2,
  QrCode,
  Copy,
  Share2,
  Filter,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  PieChart,
  Calculator,
  Shield,
  Heart,
  Star,
  Info,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@neonpro/ui";
import { cn } from "@neonpro/utils";

// Mock data for payment and billing
const mockPaymentData = {
  summary: {
    totalSpent: 3450.0,
    pendingAmount: 890.0,
    nextPaymentDate: "2024-09-01",
    paymentMethods: 3,
    completedPayments: 8,
  },
  upcomingPayments: [
    {
      id: 1,
      description: "Pacote Rejuvenescimento Facial - Parcela 2/3",
      amount: 890.0,
      dueDate: "2024-09-01",
      status: "pending",
      treatment: "Botox + Preenchimento",
      installment: "2 de 3",
      canPay: true,
      paymentMethods: ["pix", "credit_card", "bank_transfer"],
    },
    {
      id: 2,
      description: "Consulta de Retorno",
      amount: 200.0,
      dueDate: "2024-09-15",
      status: "scheduled",
      treatment: "Consulta",
      installment: "Pagamento único",
      canPay: false,
      paymentMethods: ["pix", "credit_card"],
    },
  ],
  paymentHistory: [
    {
      id: 1,
      description: "Pacote Rejuvenescimento Facial - Parcela 1/3",
      amount: 890.0,
      paidDate: "2024-08-01",
      method: "PIX",
      status: "paid",
      invoice: "INV-2024-001",
      treatment: "Botox + Preenchimento",
    },
    {
      id: 2,
      description: "Limpeza de Pele Profunda",
      amount: 450.0,
      paidDate: "2024-07-15",
      method: "Cartão de Crédito",
      status: "paid",
      invoice: "INV-2024-002",
      treatment: "Hidrafacial",
    },
    {
      id: 3,
      description: "Consulta Inicial",
      amount: 200.0,
      paidDate: "2024-07-01",
      method: "Cartão de Débito",
      status: "paid",
      invoice: "INV-2024-003",
      treatment: "Consulta",
    },
    {
      id: 4,
      description: "Criolipólise - Primeira Sessão",
      amount: 800.0,
      paidDate: "2024-06-20",
      method: "PIX",
      status: "paid",
      invoice: "INV-2024-004",
      treatment: "Criolipólise",
    },
  ],
  paymentMethods: [
    {
      id: 1,
      type: "pix",
      name: "PIX",
      description: "Pagamento instantâneo",
      fee: 0,
      processingTime: "Imediato",
      available: true,
      popular: true,
    },
    {
      id: 2,
      type: "credit_card",
      name: "Cartão de Crédito",
      description: "Visa, Mastercard, Elo",
      fee: 2.99,
      processingTime: "1-2 dias úteis",
      available: true,
      popular: true,
    },
    {
      id: 3,
      type: "debit_card",
      name: "Cartão de Débito",
      description: "Débito online",
      fee: 1.99,
      processingTime: "Imediato",
      available: true,
      popular: false,
    },
    {
      id: 4,
      type: "bank_transfer",
      name: "Transferência Bancária",
      description: "TED/DOC",
      fee: 0,
      processingTime: "1-3 dias úteis",
      available: true,
      popular: false,
    },
    {
      id: 5,
      type: "installments",
      name: "Parcelamento",
      description: "Até 12x sem juros",
      fee: 0,
      processingTime: "Conforme parcelas",
      available: true,
      popular: true,
    },
  ],
  treatmentPackages: [
    {
      id: 1,
      name: "Pacote Rejuvenescimento Completo",
      totalValue: 2670.0,
      paidValue: 890.0,
      remainingValue: 1780.0,
      installments: {
        total: 3,
        paid: 1,
        remaining: 2,
      },
      nextPayment: "2024-09-01",
      treatments: ["Botox", "Preenchimento", "Bioestimulador"],
      progress: 33,
    },
  ],
  financialSummary: {
    thisYear: {
      spent: 3450.0,
      treatments: 6,
      averagePerTreatment: 575.0,
    },
    thisMonth: {
      spent: 890.0,
      treatments: 2,
      savings: 150.0,
    },
    categoryBreakdown: [
      { category: "Facial", amount: 2200.0, percentage: 64 },
      { category: "Corporal", amount: 800.0, percentage: 23 },
      { category: "Consultas", amount: 450.0, percentage: 13 },
    ],
  },
};

function PaymentMethodCard({ method, onSelect, isSelected }: any) {
  const getMethodIcon = (type: string) => {
    switch (type) {
      case "pix":
        return <QrCode className="h-6 w-6 text-green-600" />;
      case "credit_card":
        return <CreditCard className="h-6 w-6 text-blue-600" />;
      case "debit_card":
        return <CreditCard className="h-6 w-6 text-purple-600" />;
      case "bank_transfer":
        return <Building2 className="h-6 w-6 text-orange-600" />;
      case "installments":
        return <Calculator className="h-6 w-6 text-pink-600" />;
      default:
        return <DollarSign className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20" : "",
        !method.available ? "opacity-50 cursor-not-allowed" : "",
      )}
      onClick={() => method.available && onSelect(method)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getMethodIcon(method.type)}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{method.name}</h3>
                {method.popular && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Popular
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{method.description}</p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                <span>Taxa: {method.fee}%</span>
                <span>{method.processingTime}</span>
              </div>
            </div>
          </div>

          {isSelected && <CheckCircle className="h-5 w-5 text-pink-600" />}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentForm({ payment, selectedMethod }: any) {
  const [pixKey, setPixKey] = useState("pix@neonpro.com.br");
  const [installments, setInstallments] = useState(1);

  const renderPaymentFields = () => {
    switch (selectedMethod?.type) {
      case "pix":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
              <QrCode className="h-24 w-24 mx-auto mb-4 text-green-600" />
              <p className="text-sm text-green-700 mb-2">Escaneie o QR Code ou copie a chave PIX</p>
              <div className="flex items-center space-x-2 bg-white dark:bg-green-900/20 p-3 rounded border">
                <code className="flex-1 text-sm">{pixKey}</code>
                <Button size="sm" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Valor: <span className="font-bold text-lg">R$ {payment.amount.toFixed(2)}</span>
              </p>
              <p className="text-xs text-muted-foreground">Pagamento instantâneo • Sem taxas</p>
            </div>
          </div>
        );

      case "credit_card":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input placeholder="Número do cartão" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="MM/AA" />
                <Input placeholder="CVV" />
              </div>
              <Input placeholder="Nome no cartão" />
            </div>

            {payment.amount > 300 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Parcelamento</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                >
                  {[...Array(12)].map((_, i) => {
                    const parcels = i + 1;
                    const parcelValue = payment.amount / parcels;
                    return (
                      <option key={parcels} value={parcels}>
                        {parcels}x de R$ {parcelValue.toFixed(2)}
                        {parcels <= 3 ? " (sem juros)" : " (com juros)"}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        );

      case "bank_transfer":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium mb-2">Dados para Transferência</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Banco:</span>
                  <span className="font-mono">341 - Itaú</span>
                </div>
                <div className="flex justify-between">
                  <span>Agência:</span>
                  <span className="font-mono">1234</span>
                </div>
                <div className="flex justify-between">
                  <span>Conta:</span>
                  <span className="font-mono">12345-6</span>
                </div>
                <div className="flex justify-between">
                  <span>CNPJ:</span>
                  <span className="font-mono">12.345.678/0001-90</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Valor:</span>
                  <span>R$ {payment.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Envie o comprovante para financeiro@neonpro.com.br
            </p>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-4" />
            <p>Selecione um método de pagamento</p>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalizar Pagamento</CardTitle>
        <CardDescription>{payment.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderPaymentFields()}

        {selectedMethod && (
          <div className="flex space-x-3">
            <Button className="flex-1 bg-pink-600 hover:bg-pink-700">
              <Shield className="h-4 w-4" />
              Pagar R$ {payment.amount.toFixed(2)}
            </Button>
            <Button variant="outline">Cancelar</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentHistoryTable({ payments }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {payments.map((payment: any) => (
        <Card key={payment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-pink-600" />
                </div>

                <div>
                  <h3 className="font-medium text-sm">{payment.description}</h3>
                  <p className="text-xs text-muted-foreground">{payment.treatment}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                    <span>{new Date(payment.paidDate).toLocaleDateString("pt-BR")}</span>
                    <span>{payment.method}</span>
                    <span>{payment.invoice}</span>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <p className="font-bold">R$ {payment.amount.toFixed(2)}</p>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={cn("flex items-center space-x-1", getStatusColor(payment.status))}
                  >
                    {getStatusIcon(payment.status)}
                    <span>{payment.status === "paid" ? "Pago" : "Pendente"}</span>
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FinancialSummary({ summary }: any) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gasto no Ano</p>
                <p className="text-2xl font-bold">R$ {summary.thisYear.spent.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {summary.thisYear.treatments} tratamentos
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gasto no Mês</p>
                <p className="text-2xl font-bold">R$ {summary.thisMonth.spent.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {summary.thisMonth.treatments} tratamentos
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média por Tratamento</p>
                <p className="text-2xl font-bold">
                  R$ {summary.thisYear.averagePerTreatment.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Nos últimos 12 meses</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia no Mês</p>
                <p className="text-2xl font-bold">R$ {summary.thisMonth.savings.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Em promoções</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-pink-600" />
            <span>Gastos por Categoria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.categoryBreakdown.map((category: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{category.category}</span>
                  <span>
                    R$ {category.amount.toFixed(2)} ({category.percentage}%)
                  </span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PaymentBilling() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePayNow = (payment: any) => {
    setSelectedPayment(payment);
    setSelectedPaymentMethod(null);
  };

  if (selectedPayment) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={() => setSelectedPayment(null)}>
          ← Voltar
        </Button>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Escolha o Método de Pagamento</CardTitle>
            <CardDescription>
              Pagamento: {selectedPayment.description} - R$ {selectedPayment.amount.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {mockPaymentData.paymentMethods
                .filter((method) => selectedPayment.paymentMethods.includes(method.type))
                .map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    onSelect={setSelectedPaymentMethod}
                    isSelected={selectedPaymentMethod?.id === method.id}
                  />
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        {selectedPaymentMethod && (
          <PaymentForm payment={selectedPayment} selectedMethod={selectedPaymentMethod} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Pagamentos e Faturamento
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus pagamentos e acompanhe seu histórico financeiro
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Pendente</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {mockPaymentData.summary.pendingAmount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Vence em{" "}
                  {new Date(mockPaymentData.summary.nextPaymentDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gasto</p>
                <p className="text-2xl font-bold">
                  R$ {mockPaymentData.summary.totalSpent.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mockPaymentData.summary.completedPayments} pagamentos
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Métodos Ativos</p>
                <p className="text-2xl font-bold">{mockPaymentData.summary.paymentMethods}</p>
                <p className="text-xs text-muted-foreground">Cartões e contas</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próximo Vencimento</p>
                <p className="text-lg font-bold">01/09</p>
                <p className="text-xs text-muted-foreground">Em 2 semanas</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pendentes ({mockPaymentData.upcomingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Histórico ({mockPaymentData.paymentHistory.length})
          </TabsTrigger>
          <TabsTrigger value="packages">Pacotes</TabsTrigger>
          <TabsTrigger value="analytics">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {mockPaymentData.upcomingPayments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum pagamento pendente</h3>
                <p className="text-muted-foreground text-center">
                  Todos os seus pagamentos estão em dia!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockPaymentData.upcomingPayments.map((payment) => (
                <Card key={payment.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{payment.description}</h3>
                        <p className="text-sm text-muted-foreground">{payment.treatment}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Vence em {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <Badge variant="outline">{payment.installment}</Badge>
                        </div>
                      </div>

                      <div className="text-right space-y-3">
                        <p className="text-2xl font-bold">R$ {payment.amount.toFixed(2)}</p>
                        <div className="flex space-x-2">
                          {payment.canPay ? (
                            <Button
                              className="bg-pink-600 hover:bg-pink-700"
                              onClick={() => handlePayNow(payment)}
                            >
                              <CreditCard className="h-4 w-4" />
                              Pagar Agora
                            </Button>
                          ) : (
                            <Badge variant="secondary">Aguardando consulta</Badge>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por tratamento, valor ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </div>

          <PaymentHistoryTable payments={mockPaymentData.paymentHistory} />
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          {mockPaymentData.treatmentPackages.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span>{pkg.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-xl font-bold">R$ {pkg.totalValue.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Valor Pago</p>
                    <p className="text-xl font-bold text-green-600">
                      R$ {pkg.paidValue.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Restante</p>
                    <p className="text-xl font-bold text-red-600">
                      R$ {pkg.remainingValue.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso de Pagamento</span>
                    <span>{pkg.progress}%</span>
                  </div>
                  <Progress value={pkg.progress} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    {pkg.installments.paid} de {pkg.installments.total} parcelas pagas
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pkg.treatments.map((treatment, index) => (
                    <Badge key={index} variant="outline">
                      {treatment}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics">
          <FinancialSummary summary={mockPaymentData.financialSummary} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
