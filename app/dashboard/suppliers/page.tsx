// =====================================================================================
// SUPPLIER MANAGEMENT PAGE
// Epic 6 - Story 6.3: Main page for supplier management dashboard
// =====================================================================================

"use client";

import { SupplierDashboard } from "@/components/dashboard/suppliers/SupplierDashboard";

export default function SuppliersPage() {
  // For now, using a default clinic ID - this would come from auth/session in production
  const clinicId = "default-clinic";

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <SupplierDashboard clinicId={clinicId} />
    </div>
  );
}
