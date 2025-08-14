"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Briefcase, 
  Clock, 
  ShieldCheck, 
  Plug, 
  CreditCard, 
  Settings, 
  Download,
  AlertTriangle
} from "lucide-react";

// Import settings components
import ClinicProfile from "@/components/settings/clinic-profile";
import StaffManagement from "@/components/settings/staff-management";
import ServiceCatalog from "@/components/settings/service-catalog";
import BusinessSettings from "@/components/settings/business-settings";
import ComplianceSettings from "@/components/settings/compliance-settings";
import IntegrationSettings from "@/components/settings/integration-settings";
import PaymentSettings from "@/components/settings/payment-settings";
import SystemPreferences from "@/components/settings/system-preferences";
import BackupExport from "@/components/settings/backup-export";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("clinic");

  const tabs = [
    {
      id: "clinic",
      label: "Perfil da Clínica",
      icon: Building2,
      component: ClinicProfile,
      description: "Informações básicas, endereço e CNPJ",
      compliance: false
    },
    {
      id: "staff",
      label: "Equipe Médica",
      icon: Users,
      component: StaffManagement,
      description: "Gestão de profissionais e validação CRM",
      compliance: true
    },
    {
      id: "services",
      label: "Catálogo de Serviços",
      icon: Briefcase,
      component: ServiceCatalog,
      description: "Serviços, preços e durações",
      compliance: false
    },
    {
      id: "business",
      label: "Horário de Funcionamento",
      icon: Clock,
      component: BusinessSettings,
      description: "Horários e configurações de agendamento",
      compliance: false
    },
    {
      id: "compliance",
      label: "Conformidade Regulatória",
      icon: ShieldCheck,
      component: ComplianceSettings,
      description: "ANVISA, CFM e certificações",
      compliance: true
    },
    {
      id: "integrations",
      label: "Integrações",
      icon: Plug,
      component: IntegrationSettings,
      description: "WhatsApp, email, SMS e APIs externas",
      compliance: false
    },
    {
      id: "payments",
      label: "Métodos de Pagamento",
      icon: CreditCard,
      component: PaymentSettings,
      description: "PIX, cartões, parcelamento e boleto",
      compliance: false
    },
    {
      id: "system",
      label: "Preferências do Sistema",
      icon: Settings,
      component: SystemPreferences,
      description: "Interface, notificações e personalização",
      compliance: false
    },
    {
      id: "backup",
      label: "Backup e Exportação",
      icon: Download,
      component: BackupExport,
      description: "Gestão de dados e conformidade LGPD",
      compliance: true
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configurações da Clínica
        </h1>
        <p className="text-gray-600">
          Gerenciar todas as configurações e ajustes do sistema NeonPro
        </p>
        
        {/* Compliance Alert */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800">
              Conformidade Regulatória Ativa
            </span>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            Configurações marcadas com{" "}
            <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
              CRÍTICO
            </Badge>{" "}
            afetam a conformidade com LGPD, ANVISA e CFM
          </p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Painel de Configurações
          </CardTitle>
          <CardDescription>
            Configure todos os aspectos operacionais da sua clínica estética
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 h-auto p-2 bg-gray-50">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center p-3 h-auto data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <div className="flex items-center gap-1">
                      <IconComponent className="h-4 w-4" />
                      {tab.compliance && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs ml-1">
                          CRÍTICO
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-center mt-1 leading-tight">
                      {tab.label}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabs.map((tab) => {
              const ComponentToRender = tab.component;
              return (
                <TabsContent key={tab.id} value={tab.id} className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <tab.icon className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {tab.label}
                      </h2>
                      {tab.compliance && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Conformidade Crítica
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">{tab.description}</p>
                  </div>
                  
                  <ComponentToRender />
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Footer with compliance info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">
          Informações de Conformidade
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <strong>LGPD:</strong> Lei Geral de Proteção de Dados Pessoais
            <br />
            <span className="text-blue-600">
              Configurações de privacidade e consentimento
            </span>
          </div>
          <div>
            <strong>ANVISA:</strong> Agência Nacional de Vigilância Sanitária
            <br />
            <span className="text-blue-600">
              Licenças e dispositivos médicos
            </span>
          </div>
          <div>
            <strong>CFM:</strong> Conselho Federal de Medicina
            <br />
            <span className="text-blue-600">
              Validação profissional e telemedicina
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}