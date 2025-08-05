// =====================================================
// Resource Allocations API
// Story 2.4: Smart Resource Management - Allocations
// =====================================================

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { ResourceManager } from "@/lib/resources/resource-manager";
import type { AllocationEngine } from "@/lib/resources/allocation-engine";

// =====================================================
// GET /api/resources/allocations - List allocations
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resource_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Validate required parameters
    if (!resourceId) {
      return NextResponse.json({ error: "resource_id is required" }, { status: 400 });
    }

    // Create Supabase client and verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Initialize resource manager and fetch allocations
    const resourceManager = new ResourceManager();
    const allocations = await resourceManager.getAllocations(
      resourceId,
      startDate || undefined,
      endDate || undefined,
    );

    return NextResponse.json({
      success: true,
      data: allocations,
      count: allocations.length,
    });
  } catch (error) {
    console.error("Error fetching allocations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch allocations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// POST /api/resources/allocations - Create allocation
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { resource_id, start_time, end_time, allocation_type } = body;
    if (!resource_id || !start_time || !end_time || !allocation_type) {
      return NextResponse.json(
        { error: "resource_id, start_time, end_time, and allocation_type are required" },
        { status: 400 },
      );
    }

    // Create Supabase client and verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Initialize resource manager and create allocation
    const resourceManager = new ResourceManager();
    const newAllocation = await resourceManager.createAllocation(body, user.id);

    return NextResponse.json(
      {
        success: true,
        data: newAllocation,
        message: "Allocation created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating allocation:", error);

    // Handle specific conflict errors
    if (error instanceof Error && error.message.includes("conflict")) {
      return NextResponse.json(
        {
          error: "Resource conflict detected",
          details: error.message,
          code: "RESOURCE_CONFLICT",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create allocation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// PUT /api/resources/allocations - Update allocation
// =====================================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // Validate required fields
    if (!id || !status) {
      return NextResponse.json({ error: "Allocation id and status are required" }, { status: 400 });
    }

    // Create Supabase client and verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Initialize resource manager and update allocation status
    const resourceManager = new ResourceManager();
    await resourceManager.updateAllocationStatus(id, status);

    return NextResponse.json({
      success: true,
      message: "Allocation status updated successfully",
    });
  } catch (error) {
    console.error("Error updating allocation:", error);
    return NextResponse.json(
      {
        error: "Failed to update allocation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// DELETE /api/resources/allocations - Cancel allocation
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const allocationId = searchParams.get("id");

    // Validate required parameters
    if (!allocationId) {
      return NextResponse.json({ error: "Allocation id is required" }, { status: 400 });
    }

    // Create Supabase client and verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Initialize resource manager and cancel allocation
    const resourceManager = new ResourceManager();
    await resourceManager.cancelAllocation(allocationId);

    return NextResponse.json({
      success: true,
      message: "Allocation cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling allocation:", error);
    return NextResponse.json(
      {
        error: "Failed to cancel allocation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
