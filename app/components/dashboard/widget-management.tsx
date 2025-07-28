"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DashboardWidget {
  id: string;
  widget_type: string;
  widget_name: string;
  data_source: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  config: any;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

interface WidgetManagementProps {
  onWidgetUpdate?: () => void;
}

const WIDGET_TYPES = [
  { value: "chart", label: "Chart", icon: BarChart },
  { value: "metric", label: "Metric", icon: TrendingUp },
  { value: "table", label: "Table", icon: Users },
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "summary", label: "Summary", icon: DollarSign },
];

const DATA_SOURCES = [
  { value: "patients", label: "Patients" },
  { value: "appointments", label: "Appointments" },
  { value: "revenue", label: "Revenue" },
  { value: "treatments", label: "Treatments" },
  { value: "inventory", label: "Inventory" },
  { value: "staff", label: "Staff" },
  { value: "analytics", label: "Analytics" },
];

export function WidgetManagement({ onWidgetUpdate }: WidgetManagementProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(
    null
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    widget_name: "",
    widget_type: "",
    data_source: "",
    position_x: 0,
    position_y: 0,
    width: 4,
    height: 3,
    config: "{}",
    is_visible: true,
  });

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    try {
      const response = await fetch("/api/dashboard/widgets");
      if (!response.ok) throw new Error("Failed to fetch widgets");

      const data = await response.json();
      setWidgets(data);
    } catch (error) {
      console.error("Error fetching widgets:", error);
      toast.error("Failed to load widgets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWidget = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const config = JSON.parse(formData.config || "{}");
      const widgetData = {
        ...formData,
        config,
      };

      const response = await fetch("/api/dashboard/widgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(widgetData),
      });

      if (!response.ok) throw new Error("Failed to create widget");

      toast.success("Widget created successfully");
      setShowCreateDialog(false);
      resetForm();
      fetchWidgets();
      onWidgetUpdate?.();
    } catch (error) {
      console.error("Error creating widget:", error);
      toast.error("Failed to create widget");
    }
  };

  const handleUpdateWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWidget) return;

    try {
      const config = JSON.parse(formData.config || "{}");
      const widgetData = {
        ...formData,
        config,
      };

      const response = await fetch(
        `/api/dashboard/widgets?id=${editingWidget.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(widgetData),
        }
      );

      if (!response.ok) throw new Error("Failed to update widget");

      toast.success("Widget updated successfully");
      setEditingWidget(null);
      resetForm();
      fetchWidgets();
      onWidgetUpdate?.();
    } catch (error) {
      console.error("Error updating widget:", error);
      toast.error("Failed to update widget");
    }
  };

  const handleDeleteWidget = async (id: string) => {
    try {
      const response = await fetch(`/api/dashboard/widgets?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete widget");

      toast.success("Widget deleted successfully");
      fetchWidgets();
      onWidgetUpdate?.();
    } catch (error) {
      console.error("Error deleting widget:", error);
      toast.error("Failed to delete widget");
    }
  };

  const handleToggleVisibility = async (widget: DashboardWidget) => {
    try {
      const response = await fetch(`/api/dashboard/widgets?id=${widget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...widget,
          is_visible: !widget.is_visible,
        }),
      });

      if (!response.ok) throw new Error("Failed to update widget visibility");

      toast.success(`Widget ${widget.is_visible ? "hidden" : "shown"}`);
      fetchWidgets();
      onWidgetUpdate?.();
    } catch (error) {
      console.error("Error updating widget visibility:", error);
      toast.error("Failed to update widget visibility");
    }
  };

  const resetForm = () => {
    setFormData({
      widget_name: "",
      widget_type: "",
      data_source: "",
      position_x: 0,
      position_y: 0,
      width: 4,
      height: 3,
      config: "{}",
      is_visible: true,
    });
  };

  const startEdit = (widget: DashboardWidget) => {
    setEditingWidget(widget);
    setFormData({
      widget_name: widget.widget_name,
      widget_type: widget.widget_type,
      data_source: widget.data_source,
      position_x: widget.position_x,
      position_y: widget.position_y,
      width: widget.width,
      height: widget.height,
      config: JSON.stringify(widget.config, null, 2),
      is_visible: widget.is_visible,
    });
  };

  const getWidgetIcon = (type: string) => {
    const widgetType = WIDGET_TYPES.find((wt) => wt.value === type);
    return widgetType?.icon || BarChart;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Widget Management
          </h2>
          <p className="text-muted-foreground">
            Manage and configure your dashboard widgets
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleCreateWidget}>
              <DialogHeader>
                <DialogTitle>Create New Widget</DialogTitle>
                <DialogDescription>
                  Add a new widget to your dashboard
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="widget_name">Widget Name</Label>
                    <Input
                      id="widget_name"
                      value={formData.widget_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          widget_name: e.target.value,
                        }))
                      }
                      placeholder="Enter widget name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="widget_type">Widget Type</Label>
                    <Select
                      value={formData.widget_type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, widget_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {WIDGET_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="data_source">Data Source</Label>
                  <Select
                    value={formData.data_source}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, data_source: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_SOURCES.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="position_x">Position X</Label>
                    <Input
                      id="position_x"
                      type="number"
                      value={formData.position_x}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          position_x: parseInt(e.target.value),
                        }))
                      }
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position_y">Position Y</Label>
                    <Input
                      id="position_y"
                      type="number"
                      value={formData.position_y}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          position_y: parseInt(e.target.value),
                        }))
                      }
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.width}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          width: parseInt(e.target.value),
                        }))
                      }
                      min="1"
                      max="12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          height: parseInt(e.target.value),
                        }))
                      }
                      min="1"
                      max="12"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="config">Configuration (JSON)</Label>
                  <Textarea
                    id="config"
                    value={formData.config}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        config: e.target.value,
                      }))
                    }
                    placeholder='{"key": "value"}'
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_visible: checked }))
                    }
                  />
                  <Label htmlFor="is_visible">Visible on dashboard</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Widget</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Widget Dialog */}
      <Dialog
        open={!!editingWidget}
        onOpenChange={() => setEditingWidget(null)}
      >
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleUpdateWidget}>
            <DialogHeader>
              <DialogTitle>Edit Widget</DialogTitle>
              <DialogDescription>Update widget configuration</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_widget_name">Widget Name</Label>
                  <Input
                    id="edit_widget_name"
                    value={formData.widget_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        widget_name: e.target.value,
                      }))
                    }
                    placeholder="Enter widget name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_widget_type">Widget Type</Label>
                  <Select
                    value={formData.widget_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, widget_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {WIDGET_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit_data_source">Data Source</Label>
                <Select
                  value={formData.data_source}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, data_source: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="edit_position_x">Position X</Label>
                  <Input
                    id="edit_position_x"
                    type="number"
                    value={formData.position_x}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        position_x: parseInt(e.target.value),
                      }))
                    }
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_position_y">Position Y</Label>
                  <Input
                    id="edit_position_y"
                    type="number"
                    value={formData.position_y}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        position_y: parseInt(e.target.value),
                      }))
                    }
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_width">Width</Label>
                  <Input
                    id="edit_width"
                    type="number"
                    value={formData.width}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        width: parseInt(e.target.value),
                      }))
                    }
                    min="1"
                    max="12"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_height">Height</Label>
                  <Input
                    id="edit_height"
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        height: parseInt(e.target.value),
                      }))
                    }
                    min="1"
                    max="12"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit_config">Configuration (JSON)</Label>
                <Textarea
                  id="edit_config"
                  value={formData.config}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, config: e.target.value }))
                  }
                  placeholder='{"key": "value"}'
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_visible: checked }))
                  }
                />
                <Label htmlFor="edit_is_visible">Visible on dashboard</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingWidget(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Widget</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => {
          const IconComponent = getWidgetIcon(widget.widget_type);
          return (
            <Card key={widget.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <CardTitle className="text-sm">
                      {widget.widget_name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(widget)}
                    >
                      {widget.is_visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(widget)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Widget</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "
                            {widget.widget_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteWidget(widget.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{widget.widget_type}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data Source:</span>
                    <span>{widget.data_source}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Position:</span>
                    <span>
                      {widget.position_x}, {widget.position_y}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span>
                      {widget.width} x {widget.height}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={widget.is_visible ? "default" : "secondary"}
                    >
                      {widget.is_visible ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
