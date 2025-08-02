import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ReportFilters, ReportType, MovementType } from '@/app/lib/types/inventory-reports';

const reportFilterSchema = z.object({
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  clinic_id: z.string().optional(),
  room_id: z.string().optional(),
  category: z.string().optional(),
  item_id: z.string().optional(),
  movement_type: z.string().optional(),
  include_zero_stock: z.boolean().optional(),
});

type ReportFilterForm = z.infer<typeof reportFilterSchema>;

interface ReportFiltersFormProps {
  reportType: ReportType;
  initialFilters?: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  clinics?: Array<{ id: string; name: string }>;
  rooms?: Array<{ id: string; name: string; clinic_id: string }>;
  categories?: string[];
  items?: Array<{ id: string; name: string; sku: string }>;
  className?: string;
}

export function ReportFiltersForm({
  reportType,
  initialFilters = {},
  onFiltersChange,
  clinics = [],
  rooms = [],
  categories = [],
  items = [],
  className,
}: ReportFiltersFormProps) {
  const [selectedClinicId, setSelectedClinicId] = useState<string | undefined>(
    initialFilters.clinic_id
  );

  const form = useForm<ReportFilterForm>({
    resolver: zodResolver(reportFilterSchema),
    defaultValues: {
      start_date: initialFilters.start_date ? new Date(initialFilters.start_date) : undefined,
      end_date: initialFilters.end_date ? new Date(initialFilters.end_date) : undefined,
      clinic_id: initialFilters.clinic_id,
      room_id: initialFilters.room_id,
      category: initialFilters.category,
      item_id: initialFilters.item_id,
      movement_type: initialFilters.movement_type,
      include_zero_stock: initialFilters.include_zero_stock,
    },
  });

  const watchedValues = form.watch();

  // Filter rooms based on selected clinic
  const availableRooms = rooms.filter(
    room => !selectedClinicId || room.clinic_id === selectedClinicId
  );

  // Handle form submission
  const onSubmit = (data: ReportFilterForm) => {
    const filters: ReportFilters = {
      ...(data.start_date && { start_date: data.start_date.toISOString() }),
      ...(data.end_date && { end_date: data.end_date.toISOString() }),
      ...(data.clinic_id && { clinic_id: data.clinic_id }),
      ...(data.room_id && { room_id: data.room_id }),
      ...(data.category && { category: data.category }),
      ...(data.item_id && { item_id: data.item_id }),
      ...(data.movement_type && { movement_type: data.movement_type as MovementType }),
      ...(data.include_zero_stock !== undefined && { include_zero_stock: data.include_zero_stock }),
    };

    onFiltersChange(filters);
  };

  // Handle clinic change
  const handleClinicChange = (clinicId: string | undefined) => {
    setSelectedClinicId(clinicId);
    form.setValue('clinic_id', clinicId || '');
    // Reset room selection when clinic changes
    if (clinicId !== selectedClinicId) {
      form.setValue('room_id', '');
    }
  };

  // Get fields relevant to current report type
  const getRelevantFields = () => {
    const baseFields = ['start_date', 'end_date', 'clinic_id', 'room_id', 'category'];
    
    switch (reportType) {
      case 'stock_movement':
        return [...baseFields, 'item_id', 'movement_type'];
      case 'stock_valuation':
      case 'low_stock':
        return [...baseFields, 'item_id', 'include_zero_stock'];
      case 'expiring_items':
        return [...baseFields, 'item_id'];
      case 'transfers':
        return [...baseFields, 'item_id'];
      case 'location_performance':
        return ['start_date', 'end_date', 'clinic_id'];
      default:
        return baseFields;
    }
  };

  const relevantFields = getRelevantFields();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Report Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range */}
              {relevantFields.includes('start_date') && (
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {relevantFields.includes('end_date') && (
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Clinic Selection */}
              {relevantFields.includes('clinic_id') && (
                <FormField
                  control={form.control}
                  name="clinic_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleClinicChange(value === 'all' ? undefined : value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select clinic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Clinics</SelectItem>
                          {clinics.map((clinic) => (
                            <SelectItem key={clinic.id} value={clinic.id}>
                              {clinic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Room Selection */}
              {relevantFields.includes('room_id') && (
                <FormField
                  control={form.control}
                  name="room_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedClinicId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Rooms</SelectItem>
                          {availableRooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Category Selection */}
              {relevantFields.includes('category') && (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Item Selection */}
              {relevantFields.includes('item_id') && (
                <FormField
                  control={form.control}
                  name="item_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Items</SelectItem>
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Movement Type */}
              {relevantFields.includes('movement_type') && (
                <FormField
                  control={form.control}
                  name="movement_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Movement Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select movement type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Movements</SelectItem>
                          <SelectItem value="in">Stock In</SelectItem>
                          <SelectItem value="out">Stock Out</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                          <SelectItem value="return">Return</SelectItem>
                          <SelectItem value="waste">Waste</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              {relevantFields.includes('include_zero_stock') && (
                <FormField
                  control={form.control}
                  name="include_zero_stock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Include zero stock items
                        </FormLabel>
                        <FormDescription>
                          Include items with zero current stock in the report
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSelectedClinicId(undefined);
                  onFiltersChange({});
                }}
              >
                Clear All
              </Button>
              <Button type="submit">
                Apply Filters
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Quick filter preset buttons
interface QuickFiltersProps {
  onFilterSelect: (filters: ReportFilters) => void;
  className?: string;
}

export function QuickFilters({ onFilterSelect, className }: QuickFiltersProps) {
  const getDateFilter = (days: number) => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    return {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };
  };

  const presets = [
    { label: 'Today', filters: getDateFilter(1) },
    { label: 'Last 7 days', filters: getDateFilter(7) },
    { label: 'Last 30 days', filters: getDateFilter(30) },
    { label: 'Last 90 days', filters: getDateFilter(90) },
    { label: 'This year', filters: {
      start_date: new Date(new Date().getFullYear(), 0, 1).toISOString(),
      end_date: new Date().toISOString(),
    }},
  ];

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          onClick={() => onFilterSelect(preset.filters)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}