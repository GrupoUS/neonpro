import { ArrowLeft, Calendar, Edit, Mail, Phone } from "lucide-react";
import * as React from "react";
import type { PatientData } from "../types";
import { cn } from "../utils/cn";
import { formatters } from "../utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

export interface PatientTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  badge?: {
    text: string;
    variant?: "default" | "confirmed" | "pending" | "cancelled" | "destructive";
  };
}

interface PatientDetailLayoutProps {
  patient: PatientData;
  tabs: PatientTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onBack?: () => void;
  onEdit?: () => void;
  onCall?: (phone: string) => void;
  onEmail?: (email: string) => void;
  onScheduleAppointment?: () => void;
  headerActions?: React.ReactNode;
  sidebarContent?: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

const PatientDetailLayout = React.forwardRef<
  HTMLDivElement,
  PatientDetailLayoutProps
>(
  (
    {
      patient,
      tabs,
      activeTab,
      onTabChange,
      onBack,
      onEdit,
      onCall,
      onEmail,
      onScheduleAppointment,
      headerActions,
      sidebarContent,
      showSidebar = true,
      className,
      ...props
    },
    ref,
  ) => {
    const [currentTab, setCurrentTab] = React.useState(
      activeTab || tabs[0]?.id,
    );

    React.useEffect(() => {
      if (activeTab && activeTab !== currentTab) {
        setCurrentTab(activeTab);
      }
    }, [activeTab, currentTab]);

    const handleTabChange = (tabId: string) => {
      setCurrentTab(tabId);
      onTabChange?.(tabId);
    };

    return (
      <div
        className={cn("min-h-screen bg-background", className)}
        ref={ref}
        {...props}
      >
        {/* Header */}
        <header className="border-b bg-card">
          {/* Top Bar */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {onBack && (
                  <Button onClick={onBack} size="sm" variant="ghost">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                )}

                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage alt={patient.name} src={patient.avatar} />
                    <AvatarFallback>
                      {formatters.initials(patient.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h1 className="font-semibold text-xl">{patient.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <span>ID: {patient.id}</span>
                      <span>•</span>
                      <span>{formatters.age(patient.birthDate)} anos</span>
                      <span>•</span>
                      <Badge
                        variant={
                          patient.status === "active" ? "confirmed" : "pending"
                        }
                      >
                        {patient.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>{" "}
              <div className="flex items-center gap-2">
                {/* Quick Actions */}
                <div className="flex items-center gap-1">
                  {patient.phone && (
                    <Button
                      onClick={() => onCall?.(patient.phone!)}
                      size="sm"
                      variant="outline"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Ligar
                    </Button>
                  )}

                  {patient.email && (
                    <Button
                      onClick={() => onEmail?.(patient.email!)}
                      size="sm"
                      variant="outline"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                  )}

                  {onScheduleAppointment && (
                    <Button
                      onClick={onScheduleAppointment}
                      size="sm"
                      variant="default"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar
                    </Button>
                  )}

                  {onEdit && (
                    <Button onClick={onEdit} size="sm" variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  )}
                </div>

                {/* Header Actions */}
                {headerActions}
              </div>
            </div>
          </div>
          {/* Patient Summary */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div>
                <div className="font-medium text-muted-foreground text-sm">
                  Contato
                </div>
                <div className="mt-1 space-y-1">
                  {patient.phone && (
                    <div className="text-sm">
                      {formatters.phone(patient.phone)}
                    </div>
                  )}
                  {patient.email && (
                    <div className="text-sm">{patient.email}</div>
                  )}
                </div>
              </div>

              <div>
                <div className="font-medium text-muted-foreground text-sm">
                  Última Consulta
                </div>
                <div className="mt-1 text-sm">
                  {patient.lastVisit
                    ? formatters.relativeTime(patient.lastVisit)
                    : "Nenhuma"}
                </div>
              </div>

              <div>
                <div className="font-medium text-muted-foreground text-sm">
                  Próxima Consulta
                </div>
                <div className="mt-1 text-sm">
                  {patient.nextAppointment ? (
                    <span className="font-medium text-primary">
                      {formatters.shortDate(patient.nextAppointment)}
                    </span>
                  ) : (
                    "Nenhuma agendada"
                  )}
                </div>
              </div>

              <div>
                <div className="font-medium text-muted-foreground text-sm">
                  Total de Consultas
                </div>
                <div className="mt-1 text-sm">
                  {patient.totalAppointments || 0} consultas
                </div>
              </div>
            </div>
          </div>{" "}
          {/* Tabs Navigation */}
          <div className="px-6">
            <Tabs onValueChange={handleTabChange} value={currentTab}>
              <TabsList
                className="grid w-full"
                style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
              >
                {tabs.map((tab) => (
                  <TabsTrigger
                    className="flex items-center gap-2"
                    key={tab.id}
                    value={tab.id}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <Badge size="sm" variant={tab.badge.variant}>
                        {tab.badge.text}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Content */}
        <div
          className={cn(
            "flex flex-1 overflow-hidden",
            showSidebar && "gap-6 p-6",
          )}
        >
          {/* Main Content */}
          <div className={cn("flex-1 overflow-auto", !showSidebar && "p-6")}>
            <Tabs onValueChange={handleTabChange} value={currentTab}>
              {tabs.map((tab) => (
                <TabsContent className="space-y-6" key={tab.id} value={tab.id}>
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Sidebar */}
          {showSidebar && sidebarContent && (
            <div className="w-80 flex-shrink-0">
              <div className="space-y-4 rounded-lg border bg-card p-4">
                {sidebarContent}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

PatientDetailLayout.displayName = "PatientDetailLayout";

export { PatientDetailLayout };
export type { PatientDetailLayoutProps };
