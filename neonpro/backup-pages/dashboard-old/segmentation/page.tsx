import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import SegmentationDashboard from "@/components/dashboard/segmentation/SegmentationDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Segmentação de Pacientes | NeonPro",
  description:
    "Análise inteligente e segmentação automatizada de pacientes para otimização de resultados clínicos e financeiros.",
};

export default async function SegmentationPage() {
  const supabase = await createClient();

  // For development: Skip auth check
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  // if (!session) {
  //   redirect("/login");
  // }

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // Mock user for development
  const user = {
    id: "dev-user",
    email: "dev@neonpro.com",
  };

  return (
    <DashboardLayout user={user}>
      <SegmentationDashboard />
    </DashboardLayout>
  );
}
