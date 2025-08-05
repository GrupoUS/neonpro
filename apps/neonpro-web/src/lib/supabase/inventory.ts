/**
 * Inventory Database Functions
 * Supabase database operations for inventory management
 * Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
 */

import type { createClient } from "@/lib/supabase/client";
import type {
  AlertStatus,
  BarcodeSession,
  InventoryApiResponse,
  InventoryCategory,
  InventoryItem,
  InventoryLocation,
  MovementType,
  ScannedItem,
  SessionType,
  StockAlert,
  StockMovement,
} from "@/lib/types/inventory";

const supabase = await createClient();

// =====================================================
// INVENTORY ITEMS
// =====================================================

export async function getInventoryItems(filters?: {
  category_id?: string;
  location_id?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<InventoryApiResponse<InventoryItem[]>> {
  try {
    let query = supabase
      .from("inventory_items")
      .select(`
        *,
        category:inventory_categories(*),
        location:inventory_locations(*)
      `)
      .eq("is_active", true)
      .order("name");

    // Apply filters
    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }
    if (filters?.location_id) {
      query = query.eq("location_id", filters.location_id);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      );
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data || [],
      timestamp: new Date().toISOString(),
      total_count: count || data?.length || 0,
    };
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getInventoryItemById(
  id: string,
): Promise<InventoryApiResponse<InventoryItem | null>> {
  try {
    const { data, error } = await supabase
      .from("inventory_items")
      .select(`
        *,
        category:inventory_categories(*),
        location:inventory_locations(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getInventoryItemByBarcode(
  barcode: string,
): Promise<InventoryApiResponse<InventoryItem | null>> {
  try {
    const { data, error } = await supabase
      .from("inventory_items")
      .select(`
        *,
        category:inventory_categories(*),
        location:inventory_locations(*)
      `)
      .or(`barcode.eq.${barcode},qr_code.eq.${barcode}`)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found
      throw error;
    }

    return {
      success: true,
      data: data || null,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching inventory item by barcode:", error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function createInventoryItem(
  item: Partial<InventoryItem>,
): Promise<InventoryApiResponse<InventoryItem | null>> {
  try {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("inventory_items")
      .insert({
        ...item,
        created_by: userData.user?.id,
        last_updated_by: userData.user?.id,
      })
      .select(`
        *,
        category:inventory_categories(*),
        location:inventory_locations(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function updateInventoryItem(
  id: string,
  updates: Partial<InventoryItem>,
): Promise<InventoryApiResponse<InventoryItem | null>> {
  try {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("inventory_items")
      .update({
        ...updates,
        last_updated_by: userData.user?.id,
      })
      .eq("id", id)
      .select(`
        *,
        category:inventory_categories(*),
        location:inventory_locations(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

// =====================================================
// STOCK MOVEMENTS
// =====================================================

export async function updateStockLevel(
  inventoryItemId: string,
  quantity: number,
  movementType: MovementType,
  locationId: string,
  options?: {
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    batchNumber?: string;
    expirationDate?: string;
  },
): Promise<InventoryApiResponse<boolean>> {
  try {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase.rpc("update_stock_level", {
      p_inventory_item_id: inventoryItemId,
      p_quantity: quantity,
      p_movement_type: movementType,
      p_location_id: locationId,
      p_user_id: userData.user.id,
      p_reference_type: options?.referenceType || null,
      p_reference_id: options?.referenceId || null,
      p_notes: options?.notes || null,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error updating stock level:", error);
    return {
      success: false,
      data: false,
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getStockMovements(filters?: {
  inventory_item_id?: string;
  location_id?: string;
  movement_type?: MovementType;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}): Promise<InventoryApiResponse<StockMovement[]>> {
  try {
    let query = supabase
      .from("stock_movements")
      .select(`
        *,
        inventory_item:inventory_items(*),
        location:inventory_locations(*)
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.inventory_item_id) {
      query = query.eq("inventory_item_id", filters.inventory_item_id);
    }
    if (filters?.location_id) {
      query = query.eq("location_id", filters.location_id);
    }
    if (filters?.movement_type) {
      query = query.eq("movement_type", filters.movement_type);
    }
    if (filters?.from_date) {
      query = query.gte("created_at", filters.from_date);
    }
    if (filters?.to_date) {
      query = query.lte("created_at", filters.to_date);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data || [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

// =====================================================
// STOCK ALERTS
// =====================================================

export async function getStockAlerts(filters?: {
  status?: AlertStatus;
  severity?: string;
  alert_type?: string;
  limit?: number;
}): Promise<InventoryApiResponse<StockAlert[]>> {
  try {
    let query = supabase
      .from("stock_alerts")
      .select(`
        *,
        inventory_item:inventory_items(*)
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.severity) {
      query = query.eq("severity", filters.severity);
    }
    if (filters?.alert_type) {
      query = query.eq("alert_type", filters.alert_type);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data || [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching stock alerts:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function resolveStockAlert(
  alertId: string,
  resolutionNotes?: string,
): Promise<InventoryApiResponse<boolean>> {
  try {
    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("stock_alerts")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolved_by: userData.user?.id,
        resolution_notes: resolutionNotes,
      })
      .eq("id", alertId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error resolving stock alert:", error);
    return {
      success: false,
      data: false,
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

// =====================================================
// BARCODE SESSIONS
// =====================================================

export async function createBarcodeSession(
  sessionType: SessionType,
  locationId: string,
): Promise<InventoryApiResponse<BarcodeSession | null>> {
  try {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("barcode_sessions")
      .insert({
        user_id: userData.user.id,
        session_type: sessionType,
        location_id: locationId,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error creating barcode session:", error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function addScannedItem(
  sessionId: string,
  barcodeValue: string,
  scanResult: "success" | "item_not_found" | "invalid_barcode" | "duplicate_scan" | "error",
  inventoryItemId?: string,
  errorMessage?: string,
): Promise<InventoryApiResponse<ScannedItem | null>> {
  try {
    const { data, error } = await supabase
      .from("scanned_items")
      .insert({
        session_id: sessionId,
        barcode_value: barcodeValue,
        scan_result: scanResult,
        inventory_item_id: inventoryItemId,
        error_message: errorMessage,
        needs_manual_review: scanResult !== "success",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update session total count
    await supabase
      .from("barcode_sessions")
      .update({
        total_items_scanned: await getSessionItemCount(sessionId),
      })
      .eq("id", sessionId);

    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error adding scanned item:", error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

async function getSessionItemCount(sessionId: string): Promise<number> {
  const { count } = await supabase
    .from("scanned_items")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId);

  return count || 0;
}

export async function completeBarcodeSession(
  sessionId: string,
  notes?: string,
): Promise<InventoryApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from("barcode_sessions")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        notes: notes,
      })
      .eq("id", sessionId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error completing barcode session:", error);
    return {
      success: false,
      data: false,
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

// =====================================================
// CATEGORIES AND LOCATIONS
// =====================================================

export async function getInventoryCategories(): Promise<InventoryApiResponse<InventoryCategory[]>> {
  try {
    const { data, error } = await supabase
      .from("inventory_categories")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data || [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching inventory categories:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getInventoryLocations(): Promise<InventoryApiResponse<InventoryLocation[]>> {
  try {
    const { data, error } = await supabase
      .from("inventory_locations")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data || [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching inventory locations:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

export function subscribeToInventoryUpdates(callback: (payload: any) => void) {
  return supabase
    .channel("inventory_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "inventory_items",
      },
      callback,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "stock_movements",
      },
      callback,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "stock_alerts",
      },
      callback,
    )
    .subscribe();
}

export function subscribeToStockAlerts(callback: (payload: any) => void) {
  return supabase
    .channel("stock_alerts")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "stock_alerts",
      },
      callback,
    )
    .subscribe();
}
