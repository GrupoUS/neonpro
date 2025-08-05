// =====================================================================================
// NeonPro Inventory Dashboard Integration
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================

"use client";

import type { useInventoryAlerts } from "@/app/hooks/useInventoryAlerts";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AlertTriangle,
  Barcode,
  Clock,
  MapPin,
  Package,
  Plus,
  QrCode,
  TrendingUp,
} from "lucide-react";
import type { useState } from "react";
import type { BudgetApprovalWorkflow } from "./budget-approval-workflow";
import type { DemandForecastingEngine } from "./demand-forecasting-engine";
import type { IntelligentThresholdManager } from "./intelligent-threshold-manager";
import InventoryAlerts from "./inventory-alerts";
import InventoryOverview from "./inventory-overview";

// =====================================================================================
// TYPES & INTERFACES
// =====================================================================================

interface InventoryDashboardProps {
  defaultTab?: string;
}

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

export default function InventoryDashboard({ defaultTab = "overview" }: InventoryDashboardProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { unreadCount, criticalCount } = useInventoryAlerts();

  // =====================================================================================
  // QUICK STATS COMPONENT
  // =====================================================================================

  const QuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,247</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{criticalCount}</div>
          <p className="text-xs text-muted-foreground">Requires immediate attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 184.2k</div>
          <p className="text-xs text-muted-foreground">+8.1% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Locations</CardTitle>
          <MapPin className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4</div>
          <p className="text-xs text-muted-foreground">Active storage locations</p>
        </CardContent>
      </Card>
    </div>
  );

  // =====================================================================================
  // QUICK ACTIONS COMPONENT
  // =====================================================================================

  const QuickActions = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Common inventory management tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-20 flex-col space-y-2" variant="outline">
            <Plus className="h-6 w-6" />
            <span className="text-sm">Add Item</span>
          </Button>

          <Button className="h-20 flex-col space-y-2" variant="outline">
            <Barcode className="h-6 w-6" />
            <span className="text-sm">Scan Barcode</span>
          </Button>

          <Button className="h-20 flex-col space-y-2" variant="outline">
            <QrCode className="h-6 w-6" />
            <span className="text-sm">Scan QR Code</span>
          </Button>

          <Button className="h-20 flex-col space-y-2" variant="outline">
            <Clock className="h-6 w-6" />
            <span className="text-sm">Stock Count</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // =====================================================================================
  // MAIN RENDER
  // =====================================================================================

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <QuickStats />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <InventoryOverview />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <InventoryAlerts />
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <IntelligentThresholdManager clinicId="default-clinic" />
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <DemandForecastingEngine
            clinicId="default-clinic"
            inventoryItems={[
              {
                id: "1",
                name: "Botox",
                category: "Injectables",
                current_stock: 50,
              },
              {
                id: "2",
                name: "Hyaluronic Acid",
                category: "Fillers",
                current_stock: 30,
              },
              {
                id: "3",
                name: "Lidocaine",
                category: "Anesthetics",
                current_stock: 100,
              },
              {
                id: "4",
                name: "Syringes 1ml",
                category: "Supplies",
                current_stock: 200,
              },
              {
                id: "5",
                name: "Cotton Pads",
                category: "Consumables",
                current_stock: 500,
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <BudgetApprovalWorkflow
            clinicId="default-clinic"
            onBudgetCreated={() => {
              // Refresh budget data or show success message
              console.log("Budget created successfully");
            }}
            onApprovalActioned={() => {
              // Refresh approval data or show success message
              console.log("Approval action completed");
            }}
          />
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                Manage your inventory items, categories, and stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Items Management</h3>
                <p className="text-muted-foreground mb-4">
                  This section will contain the complete inventory items management interface.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Locations</CardTitle>
              <CardDescription>Manage storage locations and inventory distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Locations Management</h3>
                <p className="text-muted-foreground mb-4">
                  This section will contain the complete locations management interface.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Location
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Reports</CardTitle>
              <CardDescription>
                Generate detailed reports and analytics for inventory management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Reports & Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  This section will contain comprehensive reporting and analytics features.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
