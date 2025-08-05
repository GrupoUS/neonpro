/**
 * Inventory Management Dashboard Component
 * Main dashboard for real-time inventory tracking and management
 * Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
 */

"use client";

import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { useInventory } from "@/hooks/inventory/use-inventory";
import type { BarcodeResult, ConnectionStatus, InventoryItem } from "@/lib/types/inventory";
import type { InventoryStatus } from "@/lib/types/inventory";
import type {
  AlertTriangle,
  BarChart3,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Scan,
  Tags,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import type { BarcodeScanner } from "./barcode-scanner";

interface InventoryDashboardProps {
  className?: string;
}

export function InventoryDashboard({ className = "" }: InventoryDashboardProps) {
  const [activeTab, setActiveTab] = useState("items");
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<"lookup" | "receive" | "ship" | "adjust">("lookup");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const {
    state,
    isLoading,
    isUpdating,
    loadInventoryItems,
    loadCategories,
    loadLocations,
    loadAlerts,
    refreshData,
    updateStock,
    scanBarcode,
    setLocationFilter,
    setCategoryFilter,
    setSearchQuery,
    connectionStatus,
    reconnect,
  } = useInventory({
    enableRealTime: true,
    autoLoadData: true,
  });

  // Handle barcode scan
  const handleBarcodeScan = async (result: BarcodeResult) => {
    console.log("Barcode scanned:", result);

    const scanResult = await scanBarcode(result.data);

    if (scanResult.success && scanResult.item) {
      setSelectedItem(scanResult.item);

      // Handle different scan modes
      switch (scanMode) {
        case "lookup":
          // Just show item details
          break;
        case "receive":
          // TODO: Open receive dialog
          break;
        case "ship":
          // TODO: Open shipping dialog
          break;
        case "adjust":
          // TODO: Open adjustment dialog
          break;
      }
    } else {
      // Item not found - could offer to create new item
      console.warn("Item not found:", scanResult.message);
    }
  };

  // Calculate dashboard metrics
  const metrics = React.useMemo(() => {
    const totalItems = state.items.length;
    const lowStockItems = state.alerts.filter(
      (alert) => alert.alert_type === "low_stock" || alert.alert_type === "out_of_stock",
    ).length;
    const totalValue = state.items.reduce(
      (sum, item) => sum + item.unit_cost * item.current_stock,
      0,
    );
    const activeAlerts = state.alerts.filter((alert) => alert.status === "active").length;

    return {
      totalItems,
      lowStockItems,
      totalValue,
      activeAlerts,
      stockPercentage: totalItems > 0 ? ((totalItems - lowStockItems) / totalItems) * 100 : 100,
    };
  }, [state.items, state.alerts]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Get status color
  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case InventoryStatus.ACTIVE:
        return "bg-green-500";
      case InventoryStatus.INACTIVE:
        return "bg-yellow-500";
      case InventoryStatus.OUT_OF_STOCK:
        return "bg-red-500";
      case InventoryStatus.DISCONTINUED:
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  // Get connection status color
  const getConnectionStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-red-600";
      case "reconnecting":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={`inventory-dashboard ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventário</h1>
          <p className="text-gray-500">Gestão em tempo real do estoque e produtos</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Analytics Link */}
          <Link href="/dashboard/inventory/analytics">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>

          {/* Connection Status */}
          <div
            className={`flex items-center gap-1 text-sm ${getConnectionStatusColor(connectionStatus)}`}
          >
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {connectionStatus === "connected" && "Conectado"}
            {connectionStatus === "disconnected" && "Desconectado"}
            {connectionStatus === "reconnecting" && "Reconectando..."}
            {connectionStatus === "error" && "Erro de Conexão"}
          </div>

          <Button onClick={refreshData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Dialog open={showScanner} onOpenChange={setShowScanner}>
            <DialogTrigger asChild>
              <Button>
                <Scan className="h-4 w-4 mr-2" />
                Scanner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Scanner de Código de Barras</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Select value={scanMode} onValueChange={(value: any) => setScanMode(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modo de escaneamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lookup">Consultar Item</SelectItem>
                    <SelectItem value="receive">Receber Estoque</SelectItem>
                    <SelectItem value="ship">Enviar Estoque</SelectItem>
                    <SelectItem value="adjust">Ajustar Estoque</SelectItem>
                  </SelectContent>
                </Select>

                <BarcodeScanner
                  onScan={handleBarcodeScan}
                  continuous={true}
                  showHistory={true}
                  autoStart={true}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold">{metrics.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.totalValue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                <p className="text-2xl font-bold text-red-600">{metrics.activeAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Health */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Saúde do Estoque</h3>
            <Badge variant={metrics.stockPercentage >= 80 ? "default" : "destructive"}>
              {metrics.stockPercentage.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={metrics.stockPercentage} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">
            {metrics.totalItems - metrics.lowStockItems} de {metrics.totalItems} itens com estoque
            adequado
          </p>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {state.alerts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Ativos ({state.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} variant="destructive">
                  <AlertDescription className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <Badge variant="outline">{alert.alert_type}</Badge>
                  </AlertDescription>
                </Alert>
              ))}
              {state.alerts.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  E mais {state.alerts.length - 5} alertas...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="items">Itens</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="locations">Locais</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Itens do Inventário</CardTitle>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-64">
                  <Input
                    placeholder="Buscar itens..."
                    value={state.searchQuery || ""}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Select value={state.selectedLocation || ""} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os locais</SelectItem>
                    {state.locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={state.selectedCategory || ""} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {state.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Item
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Carregando itens...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.items.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold truncate">{item.name}</h4>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>

                        <div className="flex items-center justify-between text-sm">
                          <span>
                            Estoque: <strong>{item.current_stock}</strong>
                          </span>
                          <span>Min: {item.minimum_stock}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm mt-2">
                          <span>{formatCurrency(item.unit_cost)}</span>
                          <Badge variant="outline">{item.unit_of_measure}</Badge>
                        </div>

                        {item.barcode && (
                          <div className="mt-2 text-xs text-gray-500 font-mono">{item.barcode}</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs content would go here */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Movimentações de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Movimentações em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Locais de Armazenamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.locations.map((location) => (
                  <Card key={location.id}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{location.name}</h4>
                      <p className="text-sm text-gray-600">{location.description}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {location.location_type}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <Tags className="h-3 w-3" />
                        Categoria
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios e Análises</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Relatórios em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InventoryDashboard;
