import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loading } from "@/components/ui/loading";
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
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </DashboardLayout>
  );
}
