// =====================================================================================
// NeonPro Inventory Dashboard Overview Component
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================

"use client";

import { createClient } from "@/app/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Archive,
  Barcode,
  Edit,
  Eye,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// =====================================================================================
// TYPES & INTERFACES
// =====================================================================================

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  barcode?: string;
  unit: string;
  reorder_level: number;
  reorder_quantity: number;
  cost?: number;
  status: "active" | "inactive";
  category?: {
    id: string;
    name: string;
  };
  stock_levels?: {
    id: string;
    current_quantity: number;
    available_quantity: number;
    reserved_quantity: number;
    location: {
      name: string;
    };
  }[];
}

interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
}

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

export default function InventoryOverview() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [showLowStock, setShowLowStock] = useState(false);

  const supabase = createClient();

  // =====================================================================================
  // DATA FETCHING
  // =====================================================================================

  const fetchInventoryData = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        lowStock: showLowStock.toString(),
        limit: "50",
      });

      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }

      // Fetch inventory items
      const response = await fetch(`/api/inventory/items?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch inventory data");
      }

      const data = await response.json();
      setItems(data.items || []);

      // Calculate stats
      calculateStats(data.items || []);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (inventoryItems: InventoryItem[]) => {
    const stats = inventoryItems.reduce(
      (acc, item) => {
        const totalStock =
          item.stock_levels?.reduce(
            (sum, level) => sum + level.available_quantity,
            0
          ) || 0;
        const itemValue = (item.cost || 0) * totalStock;

        acc.totalItems += 1;
        acc.totalValue += itemValue;

        if (totalStock === 0) {
          acc.outOfStockItems += 1;
        } else if (totalStock <= item.reorder_level) {
          acc.lowStockItems += 1;
        }

        return acc;
      },
      {
        totalItems: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        totalValue: 0,
      }
    );

    setStats(stats);
  };

  // =====================================================================================
  // EFFECTS
  // =====================================================================================

  useEffect(() => {
    fetchInventoryData();
  }, [searchTerm, categoryFilter, statusFilter, showLowStock]);

  // =====================================================================================
  // UTILITY FUNCTIONS
  // =====================================================================================

  const getStockStatus = (item: InventoryItem) => {
    const totalStock =
      item.stock_levels?.reduce(
        (sum, level) => sum + level.available_quantity,
        0
      ) || 0;

    if (totalStock === 0) {
      return {
        status: "out-of-stock",
        color: "destructive",
        text: "Out of Stock",
      };
    } else if (totalStock <= item.reorder_level) {
      return { status: "low-stock", color: "warning", text: "Low Stock" };
    } else {
      return { status: "in-stock", color: "success", text: "In Stock" };
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // =====================================================================================
  // RENDER
  // =====================================================================================

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Items need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.outOfStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Items unavailable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Inventory Items</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchInventoryData()}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showLowStock ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLowStock(!showLowStock)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Low Stock
              </Button>
            </div>
          </div>

          {/* Items List */}
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading inventory...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const stockStatus = getStockStatus(item);
                const totalStock =
                  item.stock_levels?.reduce(
                    (sum, level) => sum + level.available_quantity,
                    0
                  ) || 0;

                return (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>SKU: {item.sku}</span>
                              {item.barcode && (
                                <span className="flex items-center">
                                  <Barcode className="h-3 w-3 mr-1" />
                                  {item.barcode}
                                </span>
                              )}
                              <span>Unit: {item.unit}</span>
                              {item.category && (
                                <Badge variant="outline">
                                  {item.category.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">
                            {totalStock} {item.unit}
                          </div>
                          <Badge variant={stockStatus.color as any}>
                            {stockStatus.text}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
