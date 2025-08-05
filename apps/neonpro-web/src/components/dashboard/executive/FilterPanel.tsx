'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Building,
  Tag,
  TrendingUp,
  BarChart3,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  Download,
  Upload,
  Trash2,
  Star,
  Settings
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// Types
import { DateRangeFilter, DashboardFilters } from '@/lib/dashboard/types';

interface FilterPanelProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  clinicId: string;
  userId: string;
  className?: string;
  isCollapsible?: boolean;
  showPresets?: boolean;
  showSaveLoad?: boolean;
}

interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: DashboardFilters;
  isDefault?: boolean;
  createdBy: string;
  createdAt: Date;
}

interface DatePreset {
  label: string;
  value: DateRangeFilter;
  description: string;
}

const DATE_PRESETS: DatePreset[] = [
  {
    label: 'Today',
    value: {
      from: new Date(),
      to: new Date(),
      preset: 'today'
    },
    description: 'Current day'
  },
  {
    label: 'Yesterday',
    value: {
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1),
      preset: 'yesterday'
    },
    description: 'Previous day'
  },
  {
    label: 'Last 7 Days',
    value: {
      from: subDays(new Date(), 6),
      to: new Date(),
      preset: 'last7days'
    },
    description: 'Past week including today'
  },
  {
    label: 'Last 30 Days',
    value: {
      from: subDays(new Date(), 29),
      to: new Date(),
      preset: 'last30days'
    },
    description: 'Past month including today'
  },
  {
    label: 'This Week',
    value: {
      from: startOfWeek(new Date()),
      to: endOfWeek(new Date()),
      preset: 'thisweek'
    },
    description: 'Current week (Mon-Sun)'
  },
  {
    label: 'This Month',
    value: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
      preset: 'thismonth'
    },
    description: 'Current calendar month'
  },
  {
    label: 'Last Month',
    value: {
      from: startOfMonth(subDays(new Date(), 30)),
      to: endOfMonth(subDays(new Date(), 30)),
      preset: 'lastmonth'
    },
    description: 'Previous calendar month'
  },
  {
    label: 'Quarter to Date',
    value: {
      from: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1),
      to: new Date(),
      preset: 'qtd'
    },
    description: 'Current quarter to date'
  },
  {
    label: 'Year to Date',
    value: {
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(),
      preset: 'ytd'
    },
    description: 'Current year to date'
  }
];

const DEPARTMENT_OPTIONS = [
  { value: 'all', label: 'All Departments' },
  { value: 'reception', label: 'Reception' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'billing', label: 'Billing' },
  { value: 'administration', label: 'Administration' }
];

const PROVIDER_OPTIONS = [
  { value: 'all', label: 'All Providers' },
  { value: 'dr-silva', label: 'Dr. Silva' },
  { value: 'dr-santos', label: 'Dr. Santos' },
  { value: 'dr-oliveira', label: 'Dr. Oliveira' },
  { value: 'dr-costa', label: 'Dr. Costa' },
  { value: 'dr-ferreira', label: 'Dr. Ferreira' }
];

const PATIENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Patients' },
  { value: 'new', label: 'New Patients' },
  { value: 'returning', label: 'Returning Patients' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'walk-in', label: 'Walk-in' }
];

const METRIC_CATEGORIES = [
  { value: 'financial', label: 'Financial', icon: TrendingUp },
  { value: 'operational', label: 'Operational', icon: BarChart3 },
  { value: 'clinical', label: 'Clinical', icon: Users },
  { value: 'satisfaction', label: 'Satisfaction', icon: Star },
  { value: 'efficiency', label: 'Efficiency', icon: Clock }
];

export function FilterPanel({
  filters,
  onFiltersChange,
  clinicId,
  userId,
  className = '',
  isCollapsible = true,
  showPresets = true,
  showSaveLoad = true
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  // Load saved presets
  useEffect(() => {
    const loadPresets = async () => {
      try {
        // Simulate API call - replace with actual implementation
        const mockPresets = generateMockPresets(clinicId, userId);
        setSavedPresets(mockPresets);
      } catch (err) {
        console.error('Failed to load filter presets:', err);
      }
    };

    loadPresets();
  }, [clinicId, userId]);

  // Handle filter changes
  const updateFilters = (updates: Partial<DashboardFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  // Handle date range selection
  const handleDatePresetSelect = (preset: DatePreset) => {
    updateFilters({ dateRange: preset.value });
  };

  const handleCustomDateRange = (from: Date | undefined, to: Date | undefined) => {
    if (from && to) {
      updateFilters({
        dateRange: {
          from,
          to,
          preset: 'custom'
        }
      });
    }
  };

  // Handle department selection
  const handleDepartmentChange = (department: string, checked: boolean) => {
    const currentDepartments = filters.departments || [];
    let newDepartments: string[];

    if (department === 'all') {
      newDepartments = checked ? DEPARTMENT_OPTIONS.slice(1).map(d => d.value) : [];
    } else {
      if (checked) {
        newDepartments = [...currentDepartments.filter(d => d !== 'all'), department];
      } else {
        newDepartments = currentDepartments.filter(d => d !== department && d !== 'all');
      }
    }

    updateFilters({ departments: newDepartments });
  };

  // Handle provider selection
  const handleProviderChange = (provider: string, checked: boolean) => {
    const currentProviders = filters.providers || [];
    let newProviders: string[];

    if (provider === 'all') {
      newProviders = checked ? PROVIDER_OPTIONS.slice(1).map(p => p.value) : [];
    } else {
      if (checked) {
        newProviders = [...currentProviders.filter(p => p !== 'all'), provider];
      } else {
        newProviders = currentProviders.filter(p => p !== provider && p !== 'all');
      }
    }

    updateFilters({ providers: newProviders });
  };

  // Handle metric category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = filters.categories || [];
    let newCategories: string[];

    if (checked) {
      newCategories = [...currentCategories, category];
    } else {
      newCategories = currentCategories.filter(c => c !== category);
    }

    updateFilters({ categories: newCategories });
  };

  // Save filter preset
  const handleSavePreset = async () => {
    if (!presetName.trim()) return;

    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name: presetName,
      description: presetDescription,
      filters: { ...filters },
      createdBy: userId,
      createdAt: new Date()
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSavedPresets(prev => [...prev, newPreset]);
      setShowSaveDialog(false);
      setPresetName('');
      setPresetDescription('');
    } catch (err) {
      console.error('Failed to save preset:', err);
    }
  };

  // Load filter preset
  const handleLoadPreset = (preset: FilterPreset) => {
    onFiltersChange(preset.filters);
  };

  // Delete filter preset
  const handleDeletePreset = async (presetId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setSavedPresets(prev => prev.filter(p => p.id !== presetId));
    } catch (err) {
      console.error('Failed to delete preset:', err);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    const defaultFilters: DashboardFilters = {
      dateRange: {
        from: subDays(new Date(), 29),
        to: new Date(),
        preset: 'last30days'
      },
      departments: [],
      providers: [],
      patientTypes: [],
      categories: [],
      compareWith: undefined
    };
    onFiltersChange(defaultFilters);
  };

  // Export filters
  const handleExportFilters = () => {
    const dataStr = JSON.stringify(filters, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-filters-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Count active filters
  const activeFilterCount = (
    (filters.departments?.length || 0) +
    (filters.providers?.length || 0) +
    (filters.patientTypes?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.compareWith ? 1 : 0)
  );

  const content = (
    <div className="space-y-4">
      {/* Date Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Date Range
        </Label>
        
        <div className="grid grid-cols-2 gap-2">
          {DATE_PRESETS.slice(0, 6).map((preset) => (
            <Button
              key={preset.label}
              variant={filters.dateRange?.preset === preset.value.preset ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleDatePresetSelect(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        
        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full text-xs h-8">
              <CalendarIcon className="h-3 w-3 mr-2" />
              {filters.dateRange?.from && filters.dateRange?.to ? (
                `${format(filters.dateRange.from, 'MMM dd')} - ${format(filters.dateRange.to, 'MMM dd')}`
              ) : (
                'Custom Range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.dateRange?.from,
                to: filters.dateRange?.to
              }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  handleCustomDateRange(range.from, range.to);
                  setShowDatePicker(false);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Separator />

      {/* Compare With */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Compare With</Label>
        <Select
          value={filters.compareWith || 'none'}
          onValueChange={(value) => updateFilters({ compareWith: value === 'none' ? undefined : value as any })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Comparison</SelectItem>
            <SelectItem value="previous-period">Previous Period</SelectItem>
            <SelectItem value="previous-year">Previous Year</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="target">Target</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Metric Categories */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Metric Categories
        </Label>
        <div className="space-y-2">
          {METRIC_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isChecked = filters.categories?.includes(category.value) || false;
            
            return (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.value}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCategoryChange(category.value, !!checked)}
                />
                <label
                  htmlFor={`category-${category.value}`}
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Icon className="h-3 w-3" />
                  {category.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Departments */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Departments
              {filters.departments && filters.departments.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.departments.length}
                </Badge>
              )}
            </Label>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {DEPARTMENT_OPTIONS.map((dept) => {
                const isChecked = dept.value === 'all' 
                  ? filters.departments?.length === DEPARTMENT_OPTIONS.length - 1
                  : filters.departments?.includes(dept.value) || false;
                
                return (
                  <div key={dept.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${dept.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleDepartmentChange(dept.value, !!checked)}
                    />
                    <label
                      htmlFor={`dept-${dept.value}`}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {dept.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Providers */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Providers
              {filters.providers && filters.providers.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.providers.length}
                </Badge>
              )}
            </Label>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {PROVIDER_OPTIONS.map((provider) => {
                const isChecked = provider.value === 'all'
                  ? filters.providers?.length === PROVIDER_OPTIONS.length - 1
                  : filters.providers?.includes(provider.value) || false;
                
                return (
                  <div key={provider.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`provider-${provider.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleProviderChange(provider.value, !!checked)}
                    />
                    <label
                      htmlFor={`provider-${provider.value}`}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {provider.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Patient Types */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Patient Types</Label>
        <Select
          value={filters.patientTypes?.[0] || 'all'}
          onValueChange={(value) => updateFilters({ patientTypes: value === 'all' ? [] : [value] })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PATIENT_TYPE_OPTIONS.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Saved Presets */}
      {showPresets && savedPresets.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-medium">Saved Presets</Label>
            <div className="space-y-1">
              {savedPresets.map((preset) => (
                <div key={preset.id} className="flex items-center justify-between p-2 border rounded text-xs">
                  <div className="flex-1">
                    <div className="font-medium">{preset.name}</div>
                    {preset.description && (
                      <div className="text-muted-foreground text-xs">{preset.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleLoadPreset(preset)}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-600"
                      onClick={() => handleDeletePreset(preset.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <Separator />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={handleResetFilters} className="flex-1">
          <RefreshCw className="h-3 w-3 mr-2" />
          Reset
        </Button>
        
        {showSaveLoad && (
          <>
            <Button size="sm" variant="outline" onClick={() => setShowSaveDialog(true)}>
              <Save className="h-3 w-3 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportFilters}>
              <Download className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="space-y-2 p-3 border rounded bg-muted">
          <Label className="text-sm font-medium">Save Filter Preset</Label>
          <Input
            placeholder="Preset name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Description (optional)"
            value={presetDescription}
            onChange={(e) => setPresetDescription(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSavePreset} disabled={!presetName.trim()}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (isCollapsible) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            <ScrollArea className="h-96">
              {content}
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {content}
      </CardContent>
    </Card>
  );
}

// Helper function to generate mock presets
function generateMockPresets(clinicId: string, userId: string): FilterPreset[] {
  return [
    {
      id: 'preset-1',
      name: 'Monthly Financial Review',
      description: 'Financial metrics for current month',
      filters: {
        dateRange: {
          from: startOfMonth(new Date()),
          to: endOfMonth(new Date()),
          preset: 'thismonth'
        },
        categories: ['financial'],
        departments: ['billing', 'administration'],
        providers: [],
        patientTypes: [],
        compareWith: 'previous-period'
      },
      isDefault: true,
      createdBy: userId,
      createdAt: new Date()
    },
    {
      id: 'preset-2',
      name: 'Operational Dashboard',
      description: 'Key operational metrics',
      filters: {
        dateRange: {
          from: subDays(new Date(), 6),
          to: new Date(),
          preset: 'last7days'
        },
        categories: ['operational', 'efficiency'],
        departments: ['reception', 'consultation', 'treatment'],
        providers: [],
        patientTypes: [],
        compareWith: undefined
      },
      createdBy: userId,
      createdAt: new Date()
    }
  ];
}
