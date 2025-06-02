
import { 
  Calendar,
  Users,
  DollarSign,
  Sparkles,
  Bell
} from "lucide-react";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardCard } from "@/components/DashboardCard";
import { QuickActions } from "@/components/QuickActions";
import { AppointmentsList } from "@/components/AppointmentsList";
import { ChartPlaceholder } from "@/components/ChartPlaceholder";
import { Helmet } from "react-helmet";
import { UserMenu } from "@/components/UserMenu";

const Index = () => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <SidebarProvider>
      <Helmet>
        <title>Dashboard | NEON PRO</title>
        <meta name="description" content="Sistema de gestão premium para clínicas de estética" />
        <meta name="keywords" content="NEON PRO, clínica estética, gestão clínica, software estética" />
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
                      <Sparkles className="w-6 h-6 text-gold" />
                      <span>Bem-vinda ao seu Dashboard, Dra. Maria!</span>
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentDate} • {currentTime}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button className="relative p-2 text-gray-600 hover:text-dark-blue hover:bg-light-gray/30 rounded-lg transition-colors duration-200">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full"></span>
                  </button>
                  
                  <UserMenu />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6 space-y-8">
            {/* Overview Metrics */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stagger-item stagger-delay-1">
                <DashboardCard
                  title="Agendamentos Hoje"
                  value="5"
                  icon={<Calendar className="w-6 h-6" />}
                  actionText="Ver Agenda"
                  actionHref="/agenda"
                  trend={{ value: 12, isPositive: true }}
                />
              </div>
              
              <div className="stagger-item stagger-delay-2">
                <DashboardCard
                  title="Pacientes no Mês"
                  value="127"
                  icon={<Users className="w-6 h-6" />}
                  actionText="Ver Clientes"
                  actionHref="/clientes"
                  trend={{ value: 8, isPositive: true }}
                />
              </div>
              
              <div className="stagger-item stagger-delay-3">
                <DashboardCard
                  title="Faturamento (Mês)"
                  value="R$ 24.500"
                  icon={<DollarSign className="w-6 h-6" />}
                  actionText="Ver Financeiro"
                  actionHref="/financeiro"
                  trend={{ value: 15, isPositive: true }}
                />
              </div>
              
              <div className="stagger-item stagger-delay-4">
                <DashboardCard
                  title="Novos Pacientes (Mês)"
                  value="18"
                  icon={<Sparkles className="w-6 h-6" />}
                  subtitle="Últimos 30 dias"
                  trend={{ value: 22, isPositive: true }}
                />
              </div>
            </section>

            {/* Quick Actions */}
            <section className="fade-in-up">
              <QuickActions />
            </section>

            {/* Content Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Appointments List */}
              <div className="fade-in-up">
                <AppointmentsList />
              </div>
              
              {/* Chart Placeholder */}
              <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                <ChartPlaceholder />
              </div>
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
