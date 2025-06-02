
import { Calendar as CalendarIcon, Search, Plus, Filter } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

const AgendaPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Mock data for appointments
  const appointments = [
    {
      id: 1,
      time: "09:00",
      client: "Ana Oliveira",
      service: "Limpeza de Pele",
      professional: "Dra. Maria",
      status: "confirmed"
    },
    {
      id: 2,
      time: "10:30",
      client: "Carlos Silva",
      service: "Botox",
      professional: "Dr. Paulo",
      status: "confirmed"
    },
    {
      id: 3,
      time: "13:00",
      client: "Luciana Santos",
      service: "Preenchimento Labial",
      professional: "Dra. Maria",
      status: "pending"
    },
    {
      id: 4,
      time: "15:00",
      client: "Roberto Almeida",
      service: "Consulta Inicial",
      professional: "Dra. Maria",
      status: "canceled"
    }
  ];

  return (
    <SidebarProvider>
      <Helmet>
        <title>Agenda</title>
        <meta name="description" content="Gerencie seus agendamentos com eficiência" />
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
                      <CalendarIcon className="w-6 h-6 text-gold" />
                      <span>Agenda</span>
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Gerencie seus agendamentos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      type="search" 
                      placeholder="Buscar agendamento..." 
                      className="pl-9 w-[200px] md:w-[300px]" 
                    />
                  </div>
                  
                  <Button className="bg-gold hover:bg-gold/80 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Calendar Sidebar */}
              <div className="md:col-span-3 fade-in-up">
                <div className="bg-white rounded-xl shadow-elegant p-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-0"
                  />
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3 text-dark-blue">Profissionais</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="prof1" className="mr-2" defaultChecked />
                        <label htmlFor="prof1" className="text-sm">Dra. Maria</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="prof2" className="mr-2" defaultChecked />
                        <label htmlFor="prof2" className="text-sm">Dr. Paulo</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="prof3" className="mr-2" defaultChecked />
                        <label htmlFor="prof3" className="text-sm">Dra. Carla</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3 text-dark-blue">Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="status1" className="mr-2" defaultChecked />
                        <label htmlFor="status1" className="text-sm">Confirmado</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="status2" className="mr-2" defaultChecked />
                        <label htmlFor="status2" className="text-sm">Pendente</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="status3" className="mr-2" defaultChecked />
                        <label htmlFor="status3" className="text-sm">Cancelado</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Appointments Timeline */}
              <div className="md:col-span-9 fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="bg-white rounded-xl shadow-elegant">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-serif text-lg font-semibold text-dark-blue">
                      {date?.toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
                    </h2>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Filter className="w-4 h-4 mr-1" />
                      Filtrar
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {appointments.map(appointment => (
                        <div 
                          key={appointment.id} 
                          className={`p-4 border-l-4 rounded-r-lg shadow-sm ${
                            appointment.status === 'confirmed' ? 'border-green-500 bg-green-50/50' : 
                            appointment.status === 'pending' ? 'border-amber-500 bg-amber-50/50' : 
                            'border-red-300 bg-red-50/50'
                          }`}
                        >
                          <div className="flex flex-wrap md:flex-nowrap items-start justify-between">
                            <div className="md:w-1/4">
                              <p className="text-lg font-medium text-dark-blue">{appointment.time}</p>
                              <p className="text-sm text-gray-500">{appointment.professional}</p>
                            </div>
                            <div className="md:w-1/2">
                              <p className="font-medium text-dark-blue">{appointment.client}</p>
                              <p className="text-sm text-gray-500">{appointment.service}</p>
                            </div>
                            <div className="mt-2 md:mt-0 md:w-1/4 flex justify-end">
                              <div className={`px-3 py-1 rounded-full text-xs ${
                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {appointment.status === 'confirmed' ? 'Confirmado' : 
                                appointment.status === 'pending' ? 'Pendente' : 
                                'Cancelado'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AgendaPage;
