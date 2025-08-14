import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import CRMClientPage from "./crm-client";

export default async function CRMPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <CRMClientPage user={user} />;
}
