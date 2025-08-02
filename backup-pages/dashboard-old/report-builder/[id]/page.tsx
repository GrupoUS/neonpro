// Report Builder Editor Page
// Story 8.2: Custom Report Builder (Drag-Drop Interface)

import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ReportBuilderEditor } from "@/components/dashboard/report-builder-editor";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ReportBuilderEditorPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {params.id === "new" ? "Novo Relatório" : "Editar Relatório"}
          </h1>
          <p className="text-muted-foreground">
            Crie relatórios personalizados com nossa ferramenta de arrastar e
            soltar
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
          <ReportBuilderEditor
            reportId={params.id === "new" ? undefined : params.id}
          />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
