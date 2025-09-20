/**
 * Service Templates Management Page
 * Allows clinic staff to manage service templates and packages
 */

import { ServiceTemplateManager } from "@/components/service-templates/ServiceTemplateManager";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@neonpro/ui";
import { Button } from "@neonpro/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft } from "lucide-react";

function ServiceTemplatesPage() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para acessar o gerenciamento de
              templates.
            </p>
            <Button asChild>
              <Link to="/login">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile.clinicId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Clínica Não Encontrada
            </h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível identificar sua clínica. Entre em contato com o
              suporte.
            </p>
            <Button variant="outline" asChild>
              <Link to="/dashboard">Voltar ao Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/services">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Serviços
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Templates de Serviços
            </h1>
            <p className="text-muted-foreground">
              Gerencie templates e pacotes de serviços pré-configurados para
              agilizar o agendamento
            </p>
          </div>
        </div>

        {/* Service Template Manager */}
        <ServiceTemplateManager clinicId={profile.clinicId} />

        {/* Help Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">
              Como usar templates de serviços
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  Tipos de Templates
                </h4>
                <ul className="space-y-1">
                  <li>
                    • <span className="font-medium">Pacotes:</span> Conjunto de
                    serviços com desconto
                  </li>
                  <li>
                    • <span className="font-medium">Procedimentos:</span>{" "}
                    Procedimentos médicos específicos
                  </li>
                  <li>
                    • <span className="font-medium">Consultas:</span> Consultas
                    médicas padrão
                  </li>
                  <li>
                    • <span className="font-medium">Retornos:</span> Consultas
                    de acompanhamento
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  Estratégias de Preço
                </h4>
                <ul className="space-y-1">
                  <li>
                    • <span className="font-medium">Fixo:</span> Preço definido
                    manualmente
                  </li>
                  <li>
                    • <span className="font-medium">Calculado:</span> Soma dos
                    preços dos serviços
                  </li>
                  <li>
                    • <span className="font-medium">Personalizado:</span>{" "}
                    Definido durante agendamento
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">💡 Dica</h4>
              <p className="text-sm text-blue-800">
                Use templates destacados para promover serviços populares.
                Templates com maior uso aparecerão primeiro nas sugestões de
                agendamento.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/services">Gerenciar Serviços</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/service-categories">Categorias de Serviços</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/professional-services">Atribuições Profissionais</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/services/service-templates")({
  component: ServiceTemplatesPage,
});
