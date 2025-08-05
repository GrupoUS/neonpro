// Tax Statistics API Endpoint
// Story 5.5: Get Brazilian tax statistics and insights

import type { NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinic_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!clinicId) {
      return NextResponse.json({ error: "clinic_id is required" }, { status: 400 });
    }

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id, name")
      .eq("id", clinicId)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: "Clinic not found or access denied" }, { status: 404 });
    }

    // Build date filter
    const dateFilters = [];
    if (startDate) dateFilters.push(["created_at", "gte", startDate]);
    if (endDate) dateFilters.push(["created_at", "lte", endDate]);

    // Get tax calculation statistics
    let taxQuery = supabase.from("tax_calculations").select("*").eq("clinic_id", clinicId);

    dateFilters.forEach(([column, operator, value]) => {
      taxQuery = taxQuery.filter(column, operator, value);
    });

    const { data: taxCalculations, error: taxError } = await taxQuery;

    if (taxError) {
      console.error("Error fetching tax calculations:", taxError);
      return NextResponse.json({ error: "Failed to fetch tax calculations" }, { status: 500 });
    }

    // Get NFe statistics
    let nfeQuery = supabase.from("nfe_documents").select("*").eq("clinic_id", clinicId);

    dateFilters.forEach(([column, operator, value]) => {
      nfeQuery = nfeQuery.filter(column, operator, value);
    });

    const { data: nfeDocuments, error: nfeError } = await nfeQuery;

    if (nfeError) {
      console.error("Error fetching NFe documents:", nfeError);
      return NextResponse.json({ error: "Failed to fetch NFe documents" }, { status: 500 });
    }

    // Calculate statistics
    const stats = {
      tax_calculations: {
        total: taxCalculations.length,
        total_base_amount: taxCalculations.reduce((sum, calc) => sum + (calc.base_amount || 0), 0),
        total_tax_amount: taxCalculations.reduce((sum, calc) => {
          const taxes = calc.taxes || {};
          return (
            sum +
            Object.values(taxes).reduce((taxSum: number, tax: any) => taxSum + (tax.amount || 0), 0)
          );
        }, 0),
        total_final_amount: taxCalculations.reduce(
          (sum, calc) => sum + (calc.total_amount || 0),
          0,
        ),
        by_service_type: {},
      },
      nfe_documents: {
        total: nfeDocuments.length,
        by_status: nfeDocuments.reduce(
          (acc, nfe) => {
            acc[nfe.status] = (acc[nfe.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
        total_value: nfeDocuments.reduce((sum, nfe) => {
          const totals = nfe.totals || {};
          return sum + (totals.total || 0);
        }, 0),
        authorized_count: nfeDocuments.filter((nfe) => nfe.status === "authorized").length,
        cancelled_count: nfeDocuments.filter((nfe) => nfe.status === "cancelled").length,
      },
      compliance: {
        authorization_rate:
          nfeDocuments.length > 0
            ? (nfeDocuments.filter((nfe) => nfe.status === "authorized").length /
                nfeDocuments.length) *
              100
            : 0,
        average_processing_time: 0, // TODO: Calculate based on actual processing times
        pending_authorizations: nfeDocuments.filter((nfe) => nfe.status === "draft").length,
      },
    };

    // Calculate service type breakdown
    taxCalculations.forEach((calc) => {
      const serviceType = calc.service_type || "unknown";
      if (!stats.tax_calculations.by_service_type[serviceType]) {
        stats.tax_calculations.by_service_type[serviceType] = {
          count: 0,
          total_base: 0,
          total_tax: 0,
          total_final: 0,
        };
      }

      const serviceStats = stats.tax_calculations.by_service_type[serviceType];
      serviceStats.count++;
      serviceStats.total_base += calc.base_amount || 0;
      serviceStats.total_final += calc.total_amount || 0;

      const taxes = calc.taxes || {};
      serviceStats.total_tax += Object.values(taxes).reduce(
        (sum: number, tax: any) => sum + (tax.amount || 0),
        0,
      );
    });

    return NextResponse.json({
      success: true,
      data: {
        clinic_id: clinicId,
        period: {
          start_date: startDate,
          end_date: endDate,
        },
        statistics: stats,
      },
    });
  } catch (error) {
    console.error("Tax statistics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
