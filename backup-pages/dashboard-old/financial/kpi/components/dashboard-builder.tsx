"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Activity,
  BarChart3,
  Eye,
  EyeOff,
  GripVertical,
  Layout,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Target,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface WidgetConfig {
  id: string;
  type: "kpi_card" | "chart" | "table" | "metric";
  title: string;
  kpiId?: string;
  chartType?: "bar" | "line" | "pie" | "area";
  size: "small" | "medium" | "large";
  position: { x: number; y: number };
  visible: boolean;
  settings: Record<string, any>;
}

interface DashboardLayout {
  id: string;
  name: string;
  isDefault: boolean;
  widgets: WidgetConfig[];
  gridColumns: number;
  userId: string;
}

interface DashboardBuilderProps {
  onLayoutChange: (layout: DashboardLayout) => void;
  currentLayout?: DashboardLayout;
}

const AVAILABLE_WIDGETS = [
  {
    type: "kpi_card",
    name: "KPI Card",
    icon: Activity,
    description: "Display a single KPI with trend",
    defaultSize: "small",
  },
  {
    type: "chart",
    name: "Chart Widget",
    icon: BarChart3,
    description: "Display data in chart format",
    defaultSize: "medium",
  },
  {
    type: "table",
    name: "Data Table",
    icon: Layout,
    description: "Display data in table format",
    defaultSize: "large",
  },
  {
    type: "metric",
    name: "Metric Display",
    icon: Target,
    description: "Display multiple metrics",
    defaultSize: "medium",
  },
];

const AVAILABLE_KPIS = [
  { id: "total_revenue", name: "Receita Total", category: "revenue" },
  { id: "average_ticket", name: "Ticket Médio", category: "revenue" },
  { id: "gross_margin", name: "Margem Bruta", category: "profitability" },
  {
    id: "net_profit_margin",
    name: "Margem Líquida",
    category: "profitability",
  },
  {
    id: "patient_retention",
    name: "Retenção de Pacientes",
    category: "operational",
  },
  {
    id: "appointment_utilization",
    name: "Utilização de Agenda",
    category: "operational",
  },
  {
    id: "cash_flow_ratio",
    name: "Índice de Liquidez",
    category: "financial_health",
  },
  {
    id: "days_outstanding",
    name: "Dias em Atraso",
    category: "financial_health",
  },
];

export function DashboardBuilder({
  onLayoutChange,
  currentLayout,
}: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(
    currentLayout?.widgets || []
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(
    null
  );
  const [showAddWidget, setShowAddWidget] = useState(false);

  useEffect(() => {
    if (currentLayout) {
      setWidgets(currentLayout.widgets);
    }
  }, [currentLayout]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedWidgets = items.map((widget, index) => ({
      ...widget,
      position: { ...widget.position, y: index },
    }));

    setWidgets(updatedWidgets);
  };

  const addWidget = (type: string) => {
    const newWidget: WidgetConfig = {
      id: `widget_${Date.now()}`,
      type: type as any,
      title: `New ${type.replace("_", " ")}`,
      size:
        (AVAILABLE_WIDGETS.find((w) => w.type === type)?.defaultSize as any) ||
        "medium",
      position: { x: 0, y: widgets.length },
      visible: true,
      settings: {},
    };

    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget);
    setShowAddWidget(false);
  };

  const updateWidget = (updatedWidget: WidgetConfig) => {
    setWidgets(
      widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    );
    setSelectedWidget(updatedWidget);
  };

  const deleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId));
    setSelectedWidget(null);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(
      widgets.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    );
  };

  const saveLayout = () => {
    const layout: DashboardLayout = {
      id: currentLayout?.id || `layout_${Date.now()}`,
      name: currentLayout?.name || "Custom Layout",
      isDefault: currentLayout?.isDefault || false,
      widgets,
      gridColumns: 12,
      userId: "current_user", // In real implementation, get from auth
    };

    onLayoutChange(layout);
    setIsEditMode(false);
  };

  const resetLayout = () => {
    if (currentLayout) {
      setWidgets(currentLayout.widgets);
    } else {
      setWidgets([]);
    }
    setSelectedWidget(null);
  };

  const getWidgetIcon = (type: string) => {
    const widget = AVAILABLE_WIDGETS.find((w) => w.type === type);
    return widget?.icon || Activity;
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "small":
        return "col-span-4";
      case "medium":
        return "col-span-6";
      case "large":
        return "col-span-12";
      default:
        return "col-span-6";
    }
  };

  return (
    <div className="space-y-6">
      {/* Builder Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Dashboard Builder
              </CardTitle>
              <CardDescription>
                Customize your dashboard layout by adding, removing, and
                rearranging widgets
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="edit-mode">Modo de Edição</Label>
              <Switch
                id="edit-mode"
                checked={isEditMode}
                onCheckedChange={setIsEditMode}
              />
            </div>
          </div>
        </CardHeader>
        {isEditMode && (
          <CardContent>
            <div className="flex items-center gap-2">
              <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Widget</DialogTitle>
                    <DialogDescription>
                      Choose a widget type to add to your dashboard
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    {AVAILABLE_WIDGETS.map((widget) => {
                      const Icon = widget.icon;
                      return (
                        <Card
                          key={widget.type}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => addWidget(widget.type)}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col items-center text-center gap-2">
                              <Icon className="h-8 w-8 text-primary" />
                              <h4 className="font-medium">{widget.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {widget.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={resetLayout}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>

              <Button size="sm" onClick={saveLayout}>
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Widget Configuration Panel */}
      {isEditMode && selectedWidget && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Widget Settings: {selectedWidget.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="widget-title">Title</Label>
                <input
                  id="widget-title"
                  type="text"
                  value={selectedWidget.title}
                  onChange={(e) =>
                    updateWidget({ ...selectedWidget, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="widget-size">Size</Label>
                <Select
                  value={selectedWidget.size}
                  onValueChange={(value) =>
                    updateWidget({ ...selectedWidget, size: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (4 columns)</SelectItem>
                    <SelectItem value="medium">Medium (6 columns)</SelectItem>
                    <SelectItem value="large">Large (12 columns)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedWidget.type === "kpi_card" && (
                <div className="space-y-2">
                  <Label htmlFor="widget-kpi">KPI</Label>
                  <Select
                    value={selectedWidget.kpiId || ""}
                    onValueChange={(value) =>
                      updateWidget({ ...selectedWidget, kpiId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select KPI" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_KPIS.map((kpi) => (
                        <SelectItem key={kpi.id} value={kpi.id}>
                          {kpi.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedWidget.type === "chart" && (
                <div className="space-y-2">
                  <Label htmlFor="chart-type">Chart Type</Label>
                  <Select
                    value={selectedWidget.chartType || "bar"}
                    onValueChange={(value) =>
                      updateWidget({
                        ...selectedWidget,
                        chartType: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  checked={selectedWidget.visible}
                  onCheckedChange={() =>
                    toggleWidgetVisibility(selectedWidget.id)
                  }
                />
                <Label>Visible</Label>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteWidget(selectedWidget.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Widget
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Dashboard Preview
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Click on widgets to configure them"
              : "Your customized dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditMode ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="dashboard">
                {(provided: DroppableProvided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-12 gap-4"
                  >
                    {widgets.map((widget, index) => (
                      <Draggable
                        key={widget.id}
                        draggableId={widget.id}
                        index={index}
                      >
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${getSizeClass(widget.size)} ${!widget.visible ? "opacity-50" : ""}`}
                          >
                            <Card
                              className={`cursor-pointer transition-colors ${
                                selectedWidget?.id === widget.id
                                  ? "ring-2 ring-primary"
                                  : ""
                              }`}
                              onClick={() => setSelectedWidget(widget)}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    {React.createElement(
                                      getWidgetIcon(widget.type),
                                      {
                                        className: "h-4 w-4",
                                      }
                                    )}
                                    <span className="font-medium text-sm">
                                      {widget.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {widget.size}
                                    </Badge>
                                    {widget.visible ? (
                                      <Eye className="h-3 w-3" />
                                    ) : (
                                      <EyeOff className="h-3 w-3" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="h-24 bg-muted/30 rounded flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">
                                    {widget.type.replace("_", " ")} preview
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="grid grid-cols-12 gap-4">
              {widgets
                .filter((widget) => widget.visible)
                .map((widget) => (
                  <div key={widget.id} className={getSizeClass(widget.size)}>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          {React.createElement(getWidgetIcon(widget.type), {
                            className: "h-4 w-4",
                          })}
                          <span className="font-medium text-sm">
                            {widget.title}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 bg-muted/30 rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            {widget.type.replace("_", " ")} content
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
            </div>
          )}

          {widgets.length === 0 && (
            <div className="h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <Layout className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  No widgets added yet.{" "}
                  {isEditMode
                    ? "Click 'Add Widget' to get started."
                    : "Enable edit mode to customize."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
