// Stock Alert Configuration Form Component
// Story 11.4: Alertas e Relatórios de Estoque
// Formulário para criar e editar configurações de alertas

"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  AlertTriangle, 
  Save, 
  X,
  Bell,
  Mail,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import {
  StockAlertConfigSchema,
  CreateStockAlertConfigRequest,
  AlertType,
  SeverityLevel,
  ThresholdUnit,
  NotificationChannel,
  StockAlertError,
  ALERT_TYPE_LABELS,
  SEVERITY_LABELS,
  THRESHOLD_UNIT_LABELS,
  NOTIFICATION_CHANNEL_LABELS
} from '@/app/lib/types/stock';

// =====================================================
// TYPES AND INTERFACES
// =====================================================

interface Product {
  id: string;
  name: string;
  sku?: string;
  currentStock?: number;
  minStock?: number;
}

interface Category {
  id: string;
  name: string;
}

interface AlertConfigFormProps {
  onSubmit: (config: CreateStockAlertConfigRequest) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateStockAlertConfigRequest>;
  products?: Product[];
  categories?: Category[];
  loading?: boolean;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const getNotificationIcon = (channel: NotificationChannel) => {
  const iconProps = { className: "h-4 w-4" };
  switch (channel) {
    case 'in_app':
      return <Bell {...iconProps} />;
    case 'email':
      return <Mail {...iconProps} />;
    case 'whatsapp':
      return <MessageSquare {...iconProps} />;
    case 'sms':
      return <Smartphone {...iconProps} />;
    default:
      return <Bell {...iconProps} />;
  }
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const AlertConfigForm: React.FC<AlertConfigFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  products = [],
  categories = [],
  loading = false
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<'global' | 'product' | 'category'>('global');

  const form = useForm<CreateStockAlertConfigRequest>({
    resolver: zodResolver(StockAlertConfigSchema.omit({ id: true, clinicId: true, createdAt: true, updatedAt: true })),
    defaultValues: {
      alertType: 'low_stock',
      thresholdValue: 10,
      thresholdUnit: 'quantity',
      severityLevel: 'medium',
      isActive: true,
      notificationChannels: ['in_app'],
      ...initialData
    }
  });

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    if (initialData?.productId) {
      setSelectedScope('product');
    } else if (initialData?.categoryId) {
      setSelectedScope('category');
    } else {
      setSelectedScope('global');
    }
  }, [initialData]);

  // Reset product/category fields when scope changes
  useEffect(() => {
    if (selectedScope === 'global') {
      form.setValue('productId', undefined);
      form.setValue('categoryId', undefined);
    } else if (selectedScope === 'product') {
      form.setValue('categoryId', undefined);
    } else if (selectedScope === 'category') {
      form.setValue('productId', undefined);
    }
  }, [selectedScope, form]);

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleSubmit = async (data: CreateStockAlertConfigRequest) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      if (error instanceof StockAlertError) {
        setSubmitError(error.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Falha ao salvar configuração de alerta');
      }
    }
  };

  const handleNotificationChannelChange = (channel: NotificationChannel, checked: boolean) => {
    const currentChannels = form.getValues('notificationChannels') || [];
    
    if (checked) {
      if (!currentChannels.includes(channel)) {
        form.setValue('notificationChannels', [...currentChannels, channel]);
      }
    } else {
      form.setValue('notificationChannels', currentChannels.filter(c => c !== channel));
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {initialData ? 'Editar Configuração de Alerta' : 'Nova Configuração de Alerta'}
        </CardTitle>
        <CardDescription>
          Configure alertas automáticos para monitorar níveis de estoque e vencimentos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {submitError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Scope Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Escopo do Alerta</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scope-global"
                    name="scope"
                    value="global"
                    checked={selectedScope === 'global'}
                    onChange={(e) => e.target.checked && setSelectedScope('global')}
                    className="radio"
                  />
                  <Label htmlFor="scope-global" className="cursor-pointer">
                    Global
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scope-product"
                    name="scope"
                    value="product"
                    checked={selectedScope === 'product'}
                    onChange={(e) => e.target.checked && setSelectedScope('product')}
                    className="radio"
                  />
                  <Label htmlFor="scope-product" className="cursor-pointer">
                    Produto
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scope-category"
                    name="scope"
                    value="category"
                    checked={selectedScope === 'category'}
                    onChange={(e) => e.target.checked && setSelectedScope('category')}
                    className="radio"
                  />
                  <Label htmlFor="scope-category" className="cursor-pointer">
                    Categoria
                  </Label>
                </div>
              </div>
            </div>

            {/* Product Selection */}
            {selectedScope === 'product' && (
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} {product.sku && `(${product.sku})`}
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
            {selectedScope === 'category' && (
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Alert Type */}
            <FormField
              control={form.control}
              name="alertType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Alerta</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ALERT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Threshold Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="thresholdValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Limite</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thresholdUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(THRESHOLD_UNIT_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Severity Level */}
            <FormField
              control={form.control}
              name="severityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Severidade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notification Channels */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Canais de Notificação</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(NOTIFICATION_CHANNEL_LABELS).map(([channel, label]) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox
                      id={`channel-${channel}`}
                      checked={form.getValues('notificationChannels')?.includes(channel as NotificationChannel)}
                      onCheckedChange={(checked) => 
                        handleNotificationChannelChange(channel as NotificationChannel, !!checked)
                      }
                    />
                    <Label htmlFor={`channel-${channel}`} className="flex items-center gap-2 cursor-pointer">
                      {getNotificationIcon(channel as NotificationChannel)}
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
              {form.formState.errors.notificationChannels && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.notificationChannels.message}
                </p>
              )}
            </div>

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativo</FormLabel>
                    <FormDescription>
                      O alerta será processado automaticamente quando ativo
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Configuração'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AlertConfigForm;
