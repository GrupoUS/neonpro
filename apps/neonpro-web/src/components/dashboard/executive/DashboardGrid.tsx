'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Copy, 
  Move, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Grid3X3,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';

// Types
import { 
  DashboardLayout, 
  DashboardWidget, 
  WidgetType, 
  LayoutBreakpoint,
  GridPosition,
  WidgetConfig
} from '@/lib/dashboard/types';

// Widget Components
import { KPIWidget } from './KPIWidget';
import { ChartWidget } from './ChartWidget';
import { MetricWidget } from './MetricWidget';
import { AlertsWidget } from './AlertsWidget';
import { TableWidget } from './TableWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  isEditing?: boolean;
  onLayoutChange?: (layout: Layout[], layouts: { [key: string]: Layout[] }) => void;
  onWidgetAdd?: (widget: Partial<DashboardWidget>) => void;
  onWidgetUpdate?: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  onWidgetDelete?: (widgetId: string) => void;
  onWidgetDuplicate?: (widgetId: string) => void;
  onSaveLayout?: () => void;
  onResetLayout?: () => void;
  className?: string;
}

interface WidgetDialogState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  widget?: DashboardWidget;
}

interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  preview: string;
}

const WIDGET_TYPES: { value: WidgetType; label: string; description: string }[] = [
  { value: 'kpi', label: 'KPI Card', description: 'Display key performance indicators' },
  { value: 'chart', label: 'Chart', description: 'Various chart types for data visualization' },
  { value: 'metric', label: 'Metric', description: 'Simple metric display with trends' },
  { value: 'table', label: 'Table', description: 'Tabular data display' },
  { value: 'alerts', label: 'Alerts', description: 'System alerts and notifications' },
  { value: 'custom', label: 'Custom', description: 'Custom widget implementation' }
];

const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'executive-overview',
    name: 'Executive Overview',
    description: 'High-level KPIs and key metrics',
    preview: '📊',
    layout: {
      type: 'grid',
      columns: 12,
      rows: 8,
      gap: 16,
      responsive: true,
      areas: [
        { id: 'revenue-kpi', x: 0, y: 0, width: 3, height: 2 },
        { id: 'patients-kpi', x: 3, y: 0, width: 3, height: 2 },
        { id: 'satisfaction-kpi', x: 6, y: 0, width: 3, height: 2 },
        { id: 'growth-kpi', x: 9, y: 0, width: 3, height: 2 },
        { id: 'revenue-chart', x: 0, y: 2, width: 6, height: 4 },
        { id: 'appointments-chart', x: 6, y: 2, width: 6, height: 4 },
        { id: 'alerts-panel', x: 0, y: 6, width: 12, height: 2 }
      ]
    }
  },
  {
    id: 'operational-dashboard',
    name: 'Operational Dashboard',
    description: 'Day-to-day operational metrics',
    preview: '⚙️',
    layout: {
      type: 'grid',
      columns: 12,
      rows: 10,
      gap: 16,
      responsive: true,
      areas: [
        { id: 'occupancy-rate', x: 0, y: 0, width: 4, height: 2 },
        { id: 'avg-wait-time', x: 4, y: 0, width: 4, height: 2 },
        { id: 'staff-utilization', x: 8, y: 0, width: 4, height: 2 },
        { id: 'daily-appointments', x: 0, y: 2, width: 8, height: 4 },
        { id: 'no-shows', x: 8, y: 2, width: 4, height: 2 },
        { id: 'productivity', x: 8, y: 4, width: 4, height: 2 },
        { id: 'schedule-overview', x: 0, y: 6, width: 12, height: 4 }
      ]
    }
  },
  {
    id: 'financial-analysis',
    name: 'Financial Analysis',
    description: 'Financial performance and trends',
    preview: '💰',
    layout: {
      type: 'grid',
      columns: 12,
      rows: 8,
      gap: 16,
      responsive: true,
      areas: [
        { id: 'total-revenue', x: 0, y: 0, width: 3, height: 2 },
        { id: 'profit-margin', x: 3, y: 0, width: 3, height: 2 },
        { id: 'avg-ticket', x: 6, y: 0, width: 3, height: 2 },
        { id: 'growth-rate', x: 9, y: 0, width: 3, height: 2 },
        { id: 'revenue-trend', x: 0, y: 2, width: 8, height: 4 },
        { id: 'payment-methods', x: 8, y: 2, width: 4, height: 4 },
        { id: 'financial-summary', x: 0, y: 6, width: 12, height: 2 }
      ]
    }
  }
];

const BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0
};

const COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2
};

export function DashboardGrid({
  layout,
  widgets,
  isEditing = false,
  onLayoutChange,
  onWidgetAdd,
  onWidgetUpdate,
  onWidgetDelete,
  onWidgetDuplicate,
  onSaveLayout,
  onResetLayout,
  className
}: DashboardGridProps) {
  const [widgetDialog, setWidgetDialog] = useState<WidgetDialogState>({
    isOpen: false,
    mode: 'add'
  });
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [currentBreakpoint, setCurrentBreakpoint] = useState<LayoutBreakpoint>('lg');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [hiddenWidgets, setHiddenWidgets] = useState<Set<string>>(new Set());
  const [lockedWidgets, setLockedWidgets] = useState<Set<string>>(new Set());

  // Convert widgets to grid layout format
  const gridLayouts = useMemo(() => {
    const layouts: { [key: string]: Layout[] } = {};
    
    Object.keys(BREAKPOINTS).forEach(breakpoint => {
      layouts[breakpoint] = widgets
        .filter(widget => !hiddenWidgets.has(widget.id))
        .map(widget => ({
          i: widget.id,
          x: widget.position.x || 0,
          y: widget.position.y || 0,
          w: widget.position.width || 4,
          h: widget.position.height || 3,
          minW: widget.position.minWidth || 2,
          minH: widget.position.minHeight || 2,
          maxW: widget.position.maxWidth || 12,
          maxH: widget.position.maxHeight || 8,
          static: lockedWidgets.has(widget.id)
        }));
    });
    
    return layouts;
  }, [widgets, hiddenWidgets, lockedWidgets]);

  // Handle layout changes
  const handleLayoutChange = useCallback((currentLayout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    if (onLayoutChange && !isDragging && !isResizing) {
      onLayoutChange(currentLayout, allLayouts);
    }
  }, [onLayoutChange, isDragging, isResizing]);

  // Handle widget operations
  const handleAddWidget = useCallback(() => {
    setWidgetDialog({ isOpen: true, mode: 'add' });
  }, []);

  const handleEditWidget = useCallback((widget: DashboardWidget) => {
    setWidgetDialog({ isOpen: true, mode: 'edit', widget });
  }, []);

  const handleDeleteWidget = useCallback((widgetId: string) => {
    if (onWidgetDelete) {
      onWidgetDelete(widgetId);
    }
  }, [onWidgetDelete]);

  const handleDuplicateWidget = useCallback((widgetId: string) => {
    if (onWidgetDuplicate) {
      onWidgetDuplicate(widgetId);
    }
  }, [onWidgetDuplicate]);

  const handleToggleWidgetVisibility = useCallback((widgetId: string) => {
    setHiddenWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  }, []);

  const handleToggleWidgetLock = useCallback((widgetId: string) => {
    setLockedWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  }, []);

  // Apply layout preset
  const handleApplyPreset = useCallback((presetId: string) => {
    const preset = LAYOUT_PRESETS.find(p => p.id === presetId);
    if (preset && onLayoutChange) {
      // Convert preset to grid layout format
      const newLayout: Layout[] = preset.layout.areas.map(area => ({
        i: area.id,
        x: area.x,
        y: area.y,
        w: area.width,
        h: area.height,
        minW: area.minWidth || 2,
        minH: area.minHeight || 2,
        maxW: area.maxWidth || 12,
        maxH: area.maxHeight || 8
      }));
      
      const layouts = { [currentBreakpoint]: newLayout };
      onLayoutChange(newLayout, layouts);
    }
    setSelectedPreset('');
  }, [currentBreakpoint, onLayoutChange]);

  // Render widget based on type
  const renderWidget = useCallback((widget: DashboardWidget) => {
    const commonProps = {
      widget,
      isEditing,
      onUpdate: (updates: Partial<DashboardWidget>) => onWidgetUpdate?.(widget.id, updates)
    };

    switch (widget.widgetType) {
      case 'kpi':
        return <KPIWidget {...commonProps} />;
      case 'chart':
        return <ChartWidget {...commonProps} />;
      case 'metric':
        return <MetricWidget {...commonProps} />;
      case 'alerts':
        return <AlertsWidget {...commonProps} />;
      case 'table':
        return <TableWidget {...commonProps} />;
      default:
        return (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-2">🔧</div>
              <div>Widget type: {widget.widgetType}</div>
              <div className="text-sm">Not implemented</div>
            </div>
          </Card>
        );
    }
  }, [isEditing, onWidgetUpdate]);

  return (
    <div className={`dashboard-grid ${className || ''}`}>
      {/* Grid Controls */}
      {isEditing && (
        <div className="mb-4 flex items-center justify-between bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Button onClick={handleAddWidget} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
            
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Apply Layout Preset" />
              </SelectTrigger>
              <SelectContent>
                {LAYOUT_PRESETS.map(preset => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div className="flex items-center gap-2">
                      <span>{preset.preview}</span>
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">{preset.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedPreset && (
              <Button 
                onClick={() => handleApplyPreset(selectedPreset)} 
                size="sm" 
                variant="outline"
              >
                Apply
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setCurrentBreakpoint('xxs')} 
                    size="sm" 
                    variant={currentBreakpoint === 'xxs' ? 'default' : 'outline'}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mobile View</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setCurrentBreakpoint('sm')} 
                    size="sm" 
                    variant={currentBreakpoint === 'sm' ? 'default' : 'outline'}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tablet View</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setCurrentBreakpoint('lg')} 
                    size="sm" 
                    variant={currentBreakpoint === 'lg' ? 'default' : 'outline'}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Desktop View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="h-4 w-px bg-border" />
            
            <Button onClick={onSaveLayout} size="sm" variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            <Button onClick={onResetLayout} size="sm" variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Responsive Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={gridLayouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={60}
        margin={[layout.gap || 16, layout.gap || 16]}
        containerPadding={[0, 0]}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={setCurrentBreakpoint}
        onDragStart={() => setIsDragging(true)}
        onDragStop={() => setIsDragging(false)}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={() => setIsResizing(false)}
        useCSSTransforms
        preventCollision={false}
        compactType="vertical"
      >
        {widgets
          .filter(widget => !hiddenWidgets.has(widget.id))
          .map(widget => (
            <div key={widget.id} className="relative group">
              {/* Widget Controls */}
              {isEditing && (
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1 shadow-sm border">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEditWidget(widget)}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Widget</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleDuplicateWidget(widget.id)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicate Widget</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleToggleWidgetLock(widget.id)}
                          >
                            {lockedWidgets.has(widget.id) ? (
                              <Lock className="h-3 w-3" />
                            ) : (
                              <Unlock className="h-3 w-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {lockedWidgets.has(widget.id) ? 'Unlock' : 'Lock'} Widget
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleToggleWidgetVisibility(widget.id)}
                          >
                            <EyeOff className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Hide Widget</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteWidget(widget.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Widget</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}
              
              {/* Widget Status Indicators */}
              {isEditing && (
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                  {lockedWidgets.has(widget.id) && (
                    <Badge variant="secondary" className="h-5 px-1 text-xs">
                      <Lock className="h-2 w-2" />
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Widget Content */}
              {renderWidget(widget)}
            </div>
          ))
        }
      </ResponsiveGridLayout>

      {/* Hidden Widgets Panel */}
      {isEditing && hiddenWidgets.size > 0 && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <EyeOff className="h-4 w-4" />
            Hidden Widgets ({hiddenWidgets.size})
          </h3>
          <div className="flex flex-wrap gap-2">
            {widgets
              .filter(widget => hiddenWidgets.has(widget.id))
              .map(widget => (
                <Badge 
                  key={widget.id} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleToggleWidgetVisibility(widget.id)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {widget.title}
                </Badge>
              ))
            }
          </div>
        </div>
      )}

      {/* Widget Dialog */}
      <WidgetConfigDialog
        isOpen={widgetDialog.isOpen}
        mode={widgetDialog.mode}
        widget={widgetDialog.widget}
        onClose={() => setWidgetDialog({ isOpen: false, mode: 'add' })}
        onSave={(widget) => {
          if (widgetDialog.mode === 'add' && onWidgetAdd) {
            onWidgetAdd(widget);
          } else if (widgetDialog.mode === 'edit' && onWidgetUpdate && widgetDialog.widget) {
            onWidgetUpdate(widgetDialog.widget.id, widget);
          }
          setWidgetDialog({ isOpen: false, mode: 'add' });
        }}
      />
    </div>
  );
}

// Widget Configuration Dialog Component
interface WidgetConfigDialogProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  widget?: DashboardWidget;
  onClose: () => void;
  onSave: (widget: Partial<DashboardWidget>) => void;
}

function WidgetConfigDialog({ isOpen, mode, widget, onClose, onSave }: WidgetConfigDialogProps) {
  const [formData, setFormData] = useState<Partial<DashboardWidget>>({
    title: '',
    widgetType: 'kpi',
    dataSource: '',
    config: {},
    position: { x: 0, y: 0, width: 4, height: 3 },
    refreshInterval: 300
  });

  // Update form data when widget changes
  React.useEffect(() => {
    if (widget && mode === 'edit') {
      setFormData(widget);
    } else {
      setFormData({
        title: '',
        widgetType: 'kpi',
        dataSource: '',
        config: {},
        position: { x: 0, y: 0, width: 4, height: 3 },
        refreshInterval: 300
      });
    }
  }, [widget, mode]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Widget' : 'Edit Widget'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Widget Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter widget title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Widget Type</Label>
              <Select 
                value={formData.widgetType} 
                onValueChange={(value: WidgetType) => setFormData(prev => ({ ...prev, widgetType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WIDGET_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataSource">Data Source</Label>
            <Input
              id="dataSource"
              value={formData.dataSource || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, dataSource: e.target.value }))}
              placeholder="Enter data source endpoint or query"
            />
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                min="1"
                max="12"
                value={formData.position?.width || 4}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  position: { ...prev.position!, width: parseInt(e.target.value) }
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                min="1"
                max="10"
                value={formData.position?.height || 3}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  position: { ...prev.position!, height: parseInt(e.target.value) }
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="x">X Position</Label>
              <Input
                id="x"
                type="number"
                min="0"
                max="11"
                value={formData.position?.x || 0}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  position: { ...prev.position!, x: parseInt(e.target.value) }
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="y">Y Position</Label>
              <Input
                id="y"
                type="number"
                min="0"
                value={formData.position?.y || 0}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  position: { ...prev.position!, y: parseInt(e.target.value) }
                }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
            <Select 
              value={formData.refreshInterval?.toString() || '300'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, refreshInterval: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
                <SelectItem value="600">10 minutes</SelectItem>
                <SelectItem value="1800">30 minutes</SelectItem>
                <SelectItem value="3600">1 hour</SelectItem>
                <SelectItem value="0">Manual only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'add' ? 'Add Widget' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
