import { createClient } from "@/app/utils/supabase/server";
import SegmentationDashboard from "@/components/dashboard/segmentation/SegmentationDashboard";

export default async function SegmentationPage() {
  const supabase = await createClient();

  // For development: skip auth
  // const { data: { session } } = await supabase.auth.getSession();
  // if (!session) {
  //   redirect('/login');
  // }
  // const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Segmentação de Pacientes
        </h1>
        <p className="text-muted-foreground">
          Gerencie e analise segmentos de pacientes com insights impulsionados
          por IA.
        </p>
      </div>

      <SegmentationDashboard />
    </div>
  );
}
