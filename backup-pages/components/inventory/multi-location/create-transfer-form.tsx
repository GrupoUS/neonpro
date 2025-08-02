import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { DialogFooter } from '@/app/components/ui/dialog';
import type { CreateStockTransfer, InventoryItem } from '@/app/lib/types/inventory';

interface CreateTransferFormProps {
  onSubmit: (data: CreateStockTransfer) => void;
  inventoryItems: InventoryItem[];
  isSubmitting: boolean;
}

export function CreateTransferForm({ onSubmit, inventoryItems, isSubmitting }: CreateTransferFormProps) {
  const [formData, setFormData] = useState<Partial<CreateStockTransfer>>({
    transfer_type: 'internal',
    quantity: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inventory_item_id || !formData.quantity) {
      return;
    }

    onSubmit(formData as CreateStockTransfer);
  };

  const handleChange = (field: keyof CreateStockTransfer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="inventory_item_id">Item do Inventário</Label>
          <Select
            value={formData.inventory_item_id || ''}
            onValueChange={(value) => handleChange('inventory_item_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um item" />
            </SelectTrigger>
            <SelectContent>
              {inventoryItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} {item.sku && `(${item.sku})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transfer_type">Tipo de Transferência</Label>
          <Select
            value={formData.transfer_type || 'internal'}
            onValueChange={(value) => handleChange('transfer_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Interno</SelectItem>
              <SelectItem value="inter_clinic">Entre Clínicas</SelectItem>
              <SelectItem value="supplier_delivery">Entrega de Fornecedor</SelectItem>
              <SelectItem value="disposal">Descarte</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            type="number"
            min="1"
            value={formData.quantity || ''}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
            placeholder="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="batch_number">Número do Lote (Opcional)</Label>
          <Input
            value={formData.batch_number || ''}
            onChange={(e) => handleChange('batch_number', e.target.value)}
            placeholder="Número do lote"
          />
        </div>
      </div>

      {formData.transfer_type !== 'supplier_delivery' && (
        <div className="space-y-2">
          <Label htmlFor="from_clinic_id">Origem - Clínica</Label>
          <Select
            value={formData.from_clinic_id || ''}
            onValueChange={(value) => handleChange('from_clinic_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a clínica de origem" />
            </SelectTrigger>
            <SelectContent>
              {/* TODO: Add clinic options */}
              <SelectItem value="clinic1">Clínica Principal</SelectItem>
              <SelectItem value="clinic2">Filial Centro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.transfer_type !== 'disposal' && (
        <div className="space-y-2">
          <Label htmlFor="to_clinic_id">Destino - Clínica</Label>
          <Select
            value={formData.to_clinic_id || ''}
            onValueChange={(value) => handleChange('to_clinic_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a clínica de destino" />
            </SelectTrigger>
            <SelectContent>
              {/* TODO: Add clinic options */}
              <SelectItem value="clinic1">Clínica Principal</SelectItem>
              <SelectItem value="clinic2">Filial Centro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Observações (Opcional)</Label>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Observações sobre a transferência..."
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar Transferência'}
        </Button>
      </DialogFooter>
    </form>
  );
}