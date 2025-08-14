import { createClient } from "@/app/utils/supabase/server";
import { ExpirationAlerts } from "@/components/regulatory-documents/expiration-alerts";
import { RegulatoryDocumentsList } from "@/components/regulatory-documents/regulatory-documents-list";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { redirect } from "next/navigation";

export default async function RegulatoryDocumentsRoute() {
  const supabase = await createClient();

  // Verificar sessão de autenticação
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // Buscar dados do usuário
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Documentação Regulatória" },
  ];

  return (
    <div
      className="container mx-auto py-6 space-y-8"
      data-testid="regulatory-documents-page"
    >
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Documentação Regulatória
          </h1>
          <p className="text-muted-foreground">
            Gerencie documentos de compliance e certificações da sua clínica
          </p>
        </div>

        {/* Expiration Alerts */}
        <ExpirationAlerts />

        {/* Documents List */}
        <RegulatoryDocumentsList />
      </div>
    </div>
  );
}
