import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageLoading } from "@/components/ui/loading";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <Suspense fallback={<PageLoading />}>{children}</Suspense>
    </DashboardLayout>
  );
}
