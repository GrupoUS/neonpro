import { createClient } from "@/app/utils/supabase/server";
import { SubscriptionManagement } from "@/components/subscription/subscription-management";
import { redirect } from "next/navigation";

export default async function SubscriptionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage your NeonPro subscription and billing preferences
        </p>
      </div>

      <SubscriptionManagement />
    </div>
  );
}
