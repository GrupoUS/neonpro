
import { DollarSign, Search, Plus, Filter, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const FinanceiroPage = () => {
  const navigate = useNavigate();
  // Mock data for transactions
  const transactions = [
    { id: 1, date: "15/06/2023", description: "Procedimento - Botox", category: "Serviços", value: 1200, type: "income" },
    { id: 2, date: "15/06/2023", description: "Procedimento - Limpeza de Pele", category: "Serviços", value: 350, type: "income" },
    { id: 3, date: "14/06/2023", description: "Compra de Materiais", category: "Insumos", value: 450, type: "expense" },
    { id: 4, date: "12/06/2023", description: "Pagamento de Salários", category: "Pessoal", value: 2500, type: "expense" },
    { id: 5, date: "10/06/2023", description: "Procedimento - Preenchimento", category: "Serviços", value: 800, type: "income" },
    { id: 6, date: "08/06/2023", description: "Conta de Luz", category: "Utilidades", value: 350, type: "expense" },
  ];

  // Calculate summary
  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.value, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.value, 0);
  const balance = income - expenses;

  return (
    <SidebarProvider>
      <Helmet>
        <title>Financeiro</title>
        <meta name="description" content="Gestão financeira da sua clínica" />
      </Helmet>
      
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="lg:hidden" />
                  <div className="fade-in-up">
                    <h1 className="text-2xl font-serif font-bold text-dark-blue flex items-center space-x-2">
                      <DollarSign className="w-6 h-6 text-gold" />
                      <span>Financeiro</span>
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Gestão financeira da sua clínica
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="text-dark-blue border-gray-300">
                    <FileText className="w-4 h-4 mr-2" />
                    Relatórios
                  </Button>
                  
                  <Button 
                    className="bg-gold hover:bg-gold/80 text-white"
                    onClick={() => navigate('/financeiro/novo')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Transação
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-elegant p-6 fade-in-up">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-600">Receitas</h3>
                </div>
                <p className="text-2xl font-serif font-bold text-green-600">R$ {income.toLocaleString('pt-BR')}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-elegant p-6 fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center mb-2">
                  <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-600">Despesas</h3>
                </div>
                <p className="text-2xl font-serif font-bold text-red-600">R$ {expenses.toLocaleString('pt-BR')}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-elegant p-6 fade-in-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center mb-2">
                  <DollarSign className="w-5 h-5 text-gold mr-2" />
                  <h3 className="text-sm font-medium text-gray-600">Saldo</h3>
                </div>
                <p className={`text-2xl font-serif font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {balance.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            
            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-elegant fade-in-up">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-dark-blue">
                  Transações
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      type="search" 
                      placeholder="Buscar transação..." 
                      className="pl-9 w-[200px]" 
                    />
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Filter className="w-4 h-4 mr-1" />
                    Filtrar
                  </Button>
                </div>
              </div>
              
              <div>
                <Tabs defaultValue="all">
                  <div className="px-4 pt-2">
                    <TabsList>
                      <TabsTrigger value="all">Todas</TabsTrigger>
                      <TabsTrigger value="income">Receitas</TabsTrigger>
                      <TabsTrigger value="expense">Despesas</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="all" className="mt-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-light-gray/20">
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-light-gray/10 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{transaction.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-dark-blue">{transaction.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-light-gray/30 text-gray-800">
                                  {transaction.category}
                                </span>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'} R$ {transaction.value.toLocaleString('pt-BR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="income" className="mt-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-light-gray/20">
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.filter(t => t.type === 'income').map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-light-gray/10 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{transaction.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-dark-blue">{transaction.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-light-gray/30 text-gray-800">
                                  {transaction.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-green-600">
                                + R$ {transaction.value.toLocaleString('pt-BR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="expense" className="mt-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-light-gray/20">
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.filter(t => t.type === 'expense').map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-light-gray/10 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{transaction.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-dark-blue">{transaction.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-light-gray/30 text-gray-800">
                                  {transaction.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-red-600">
                                - R$ {transaction.value.toLocaleString('pt-BR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default FinanceiroPage;
