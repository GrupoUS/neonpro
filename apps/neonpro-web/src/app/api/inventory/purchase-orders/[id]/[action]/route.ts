// Purchase Order Approval API Endpoint
// POST /api/inventory/purchase-orders/[id]/approve - Approve purchase order
// POST /api/inventory/purchase-orders/[id]/reject - Reject purchase order

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/app/utils/supabase/server";

const approvalActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
  approved_by: z.string().min(1, "Approver ID is required"),
  approval_level: z.number().min(1).max(3).optional().default(1), // Support multi-level approval
});

interface RouteParams {
  params: { id: string; action: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = approvalActionSchema.parse({
      ...body,
      action: params.action,
    });

    // Check if purchase order exists and is in the right status
    const { data: existingPO, error: fetchError } = await supabase
      .from("purchase_orders")
      .select("id, status, total_amount, clinic_id, created_by")
      .eq("id", params.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to fetch purchase order" }, { status: 500 });
    }

    // Check if PO is in pending_approval status
    if (existingPO.status !== "pending_approval") {
      return NextResponse.json(
        {
          error: `Purchase order must be in pending_approval status. Current status: ${existingPO.status}`,
        },
        { status: 400 },
      );
    }

    // Check user permissions for approval
    const canApprove = await checkApprovalPermissions(
      supabase,
      user.id,
      existingPO.total_amount,
      existingPO.clinic_id,
      validatedData.approval_level,
    );

    if (!canApprove.allowed) {
      return NextResponse.json(
        {
          error: canApprove.reason || "Insufficient permissions to approve this purchase order",
        },
        { status: 403 },
      );
    }

    // Determine new status based on action and approval level
    let newStatus = existingPO.status;
    let approvalNotes = validatedData.notes || "";

    if (validatedData.action === "approve") {
      // Check if this is the final approval level
      const requiredApprovalLevel = getRequiredApprovalLevel(existingPO.total_amount);

      if (validatedData.approval_level >= requiredApprovalLevel) {
        newStatus = "approved";
        approvalNotes = `Approved by ${user.email} (Level ${validatedData.approval_level}). ${approvalNotes}`;
      } else {
        // Still needs higher level approval
        newStatus = "pending_approval";
        approvalNotes = `Level ${validatedData.approval_level} approval by ${user.email}. Pending Level ${validatedData.approval_level + 1} approval. ${approvalNotes}`;
      }
    } else {
      newStatus = "draft";
      approvalNotes = `Rejected by ${user.email} (Level ${validatedData.approval_level}). ${approvalNotes}`;
    }

    // Update purchase order status
    const { data: updatedPO, error: updateError } = await supabase
      .from("purchase_orders")
      .update({
        status: newStatus,
        notes: approvalNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating purchase order:", updateError);
      return NextResponse.json({ error: "Failed to update purchase order" }, { status: 500 });
    }

    // Log approval action
    const { error: logError } = await supabase.from("purchase_order_approvals").insert({
      purchase_order_id: params.id,
      action: validatedData.action,
      approved_by: user.id,
      approval_level: validatedData.approval_level,
      notes: validatedData.notes,
      created_at: new Date().toISOString(),
    });

    if (logError) {
      console.error("Error logging approval action:", logError);
      // Don't fail the request, just log the error
    }

    // Send notifications if needed
    if (newStatus === "approved") {
      await sendApprovalNotification(supabase, updatedPO, "approved");
    } else if (validatedData.action === "reject") {
      await sendApprovalNotification(supabase, updatedPO, "rejected");
    }

    return NextResponse.json({
      purchase_order: updatedPO,
      approval_action: {
        action: validatedData.action,
        level: validatedData.approval_level,
        approved_by: user.email,
        timestamp: new Date().toISOString(),
        final_approval: newStatus === "approved",
      },
      message: `Purchase order ${validatedData.action}d successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("Error in purchase order approval:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper function to check approval permissions
async function checkApprovalPermissions(
  supabase: any,
  userId: string,
  amount: number,
  clinicId: string,
  approvalLevel: number,
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Get user role and permissions
    const { data: userProfile, error } = await supabase
      .from("profiles")
      .select(`
        id,
        role,
        permissions,
        clinic_permissions (
          clinic_id,
          role,
          permissions
        )
      `)
      .eq("id", userId)
      .single();

    if (error || !userProfile) {
      return { allowed: false, reason: "User profile not found" };
    }

    // Check clinic-specific permissions
    const clinicPermission = userProfile.clinic_permissions?.find(
      (cp: any) => cp.clinic_id === clinicId,
    );

    if (!clinicPermission) {
      return { allowed: false, reason: "No permissions for this clinic" };
    }

    // Define approval thresholds by level
    const approvalThresholds = {
      1: { maxAmount: 1000, requiredRole: ["manager", "admin"] },
      2: { maxAmount: 5000, requiredRole: ["admin", "director"] },
      3: { maxAmount: Infinity, requiredRole: ["director", "owner"] },
    };

    const threshold = approvalThresholds[approvalLevel as keyof typeof approvalThresholds];

    if (!threshold) {
      return { allowed: false, reason: "Invalid approval level" };
    }

    // Check amount threshold
    if (amount > threshold.maxAmount) {
      return {
        allowed: false,
        reason: `Amount exceeds limit for approval level ${approvalLevel}`,
      };
    }

    // Check role permissions
    const userRole = clinicPermission.role || userProfile.role;
    if (!threshold.requiredRole.includes(userRole)) {
      return {
        allowed: false,
        reason: `Insufficient role permissions. Required: ${threshold.requiredRole.join(" or ")}`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking approval permissions:", error);
    return { allowed: false, reason: "Error checking permissions" };
  }
}

// Helper function to determine required approval level based on amount
function getRequiredApprovalLevel(amount: number): number {
  if (amount <= 1000) return 1;
  if (amount <= 5000) return 2;
  return 3;
}

// Helper function to send approval notifications
async function sendApprovalNotification(
  supabase: any,
  purchaseOrder: any,
  action: "approved" | "rejected",
): Promise<void> {
  try {
    // Get creator details
    const { data: creator, error } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", purchaseOrder.created_by)
      .single();

    if (error || !creator) return;

    // Create notification
    const notification = {
      recipient_id: purchaseOrder.created_by,
      title: `Purchase Order ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Purchase Order ${purchaseOrder.order_number} has been ${action}`,
      type: action === "approved" ? "purchase_order_approved" : "purchase_order_rejected",
      reference_id: purchaseOrder.id,
      data: {
        order_number: purchaseOrder.order_number,
        total_amount: purchaseOrder.total_amount,
        action: action,
      },
      created_at: new Date().toISOString(),
    };

    await supabase.from("notifications").insert(notification);
  } catch (error) {
    console.error("Error sending approval notification:", error);
  }
}
