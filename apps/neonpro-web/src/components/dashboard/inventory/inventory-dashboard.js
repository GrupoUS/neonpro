// =====================================================================================
// NeonPro Inventory Dashboard Integration
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InventoryDashboard;
var useInventoryAlerts_1 = require("@/app/hooks/useInventoryAlerts");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var budget_approval_workflow_1 = require("./budget-approval-workflow");
var demand_forecasting_engine_1 = require("./demand-forecasting-engine");
var intelligent_threshold_manager_1 = require("./intelligent-threshold-manager");
var inventory_alerts_1 = require("./inventory-alerts");
var inventory_overview_1 = require("./inventory-overview");
// =====================================================================================
// MAIN COMPONENT
// =====================================================================================
function InventoryDashboard(_a) {
  var _b = _a.defaultTab,
    defaultTab = _b === void 0 ? "overview" : _b;
  var _c = (0, react_1.useState)(defaultTab),
    activeTab = _c[0],
    setActiveTab = _c[1];
  var _d = (0, useInventoryAlerts_1.useInventoryAlerts)(),
    unreadCount = _d.unreadCount,
    criticalCount = _d.criticalCount;
  // =====================================================================================
  // QUICK STATS COMPONENT
  // =====================================================================================
  var QuickStats = function () {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Items</card_1.CardTitle>
            <lucide_react_1.Package className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Low Stock Alerts</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-500" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Inventory Value</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-green-500" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">R$ 184.2k</div>
            <p className="text-xs text-muted-foreground">+8.1% from last month</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Locations</card_1.CardTitle>
            <lucide_react_1.MapPin className="h-4 w-4 text-blue-500" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Active storage locations</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  };
  // =====================================================================================
  // QUICK ACTIONS COMPONENT
  // =====================================================================================
  var QuickActions = function () {
    return (
      <card_1.Card className="mb-6">
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Quick Actions</card_1.CardTitle>
          <card_1.CardDescription>Common inventory management tasks</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button_1.Button className="h-20 flex-col space-y-2" variant="outline">
              <lucide_react_1.Plus className="h-6 w-6" />
              <span className="text-sm">Add Item</span>
            </button_1.Button>

            <button_1.Button className="h-20 flex-col space-y-2" variant="outline">
              <lucide_react_1.Barcode className="h-6 w-6" />
              <span className="text-sm">Scan Barcode</span>
            </button_1.Button>

            <button_1.Button className="h-20 flex-col space-y-2" variant="outline">
              <lucide_react_1.QrCode className="h-6 w-6" />
              <span className="text-sm">Scan QR Code</span>
            </button_1.Button>

            <button_1.Button className="h-20 flex-col space-y-2" variant="outline">
              <lucide_react_1.Clock className="h-6 w-6" />
              <span className="text-sm">Stock Count</span>
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
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
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-7">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts" className="relative">
            Alerts
            {unreadCount > 0 && (
              <badge_1.Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </badge_1.Badge>
            )}
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="thresholds">Thresholds</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="forecasting">Forecasting</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="budget">Budget</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="items">Items</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="locations">Locations</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports">Reports</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          <inventory_overview_1.default />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="alerts" className="space-y-4">
          <inventory_alerts_1.default />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="thresholds" className="space-y-4">
          <intelligent_threshold_manager_1.IntelligentThresholdManager clinicId="default-clinic" />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="forecasting" className="space-y-4">
          <demand_forecasting_engine_1.DemandForecastingEngine
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
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="budget" className="space-y-4">
          <budget_approval_workflow_1.BudgetApprovalWorkflow
            clinicId="default-clinic"
            onBudgetCreated={function () {
              // Refresh budget data or show success message
              console.log("Budget created successfully");
            }}
            onApprovalActioned={function () {
              // Refresh approval data or show success message
              console.log("Approval action completed");
            }}
          />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="items" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Inventory Items</card_1.CardTitle>
              <card_1.CardDescription>
                Manage your inventory items, categories, and stock levels
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-12">
                <lucide_react_1.Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Items Management</h3>
                <p className="text-muted-foreground mb-4">
                  This section will contain the complete inventory items management interface.
                </p>
                <button_1.Button>
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Add New Item
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="locations" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Storage Locations</card_1.CardTitle>
              <card_1.CardDescription>
                Manage storage locations and inventory distribution
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-12">
                <lucide_react_1.MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Locations Management</h3>
                <p className="text-muted-foreground mb-4">
                  This section will contain the complete locations management interface.
                </p>
                <button_1.Button>
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Add New Location
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="reports" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Inventory Reports</card_1.CardTitle>
              <card_1.CardDescription>
                Generate detailed reports and analytics for inventory management
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-12">
                <lucide_react_1.TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Reports & Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  This section will contain comprehensive reporting and analytics features.
                </p>
                <button_1.Button>
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
