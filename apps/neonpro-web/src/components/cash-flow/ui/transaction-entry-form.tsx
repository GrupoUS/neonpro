// Transaction Entry Form - Add/Edit cash flow transactions
// Following financial dashboard patterns from Context7 research

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CashFlowEntrySchema, type CashFlowEntryInput } from '../utils/validation';
import { useCashFlow } from '../hooks/use-cash-flow';
import { useCashRegisters } from '../hooks/use-cash-registers';
import { 
  formatCurrency, 
  getTransactionTypeDisplayName,
  getCategoryDisplayName,
  getPaymentMethodDisplayName,
  generateReferenceNumber
} from '../utils/calculations';

interface TransactionEntryFormProps {
  clinicId: string;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionEntryForm({ 
  clinicId, 
  userId, 
  onSuccess, 
  onCancel 
}: TransactionEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEntry } = useCashFlow(clinicId);
  const { registers } = useCashRegisters(clinicId);

  const form = useForm<CashFlowEntryInput>({
    resolver: zodResolver(CashFlowEntrySchema),
    defaultValues: {
      clinic_id: clinicId,
      created_by: userId,
      currency: 'BRL',
      transaction_type: 'receipt',
      category: 'service_payment',
      payment_method: 'cash'
    }
  });

  const onSubmit = async (data: CashFlowEntryInput) => {
    try {
      setIsSubmitting(true);
      
      // Generate reference number if not provided
      const entryData = {
        ...data,
        reference_number: data.reference_number || generateReferenceNumber(data.transaction_type)
      };

      await createEntry(entryData);
      toast.success('Transação criada com sucesso!');
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Erro ao criar transação');
    } finally {
      setIsSubmitting(false);
    }
  };  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Nova Transação</CardTitle>
        <CardDescription>
          Registre uma nova movimentação financeira
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="transaction_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Transação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="receipt">Recebimento</SelectItem>
                        <SelectItem value="payment">Pagamento</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                        <SelectItem value="adjustment">Ajuste</SelectItem>
                        <SelectItem value="opening_balance">Saldo Inicial</SelectItem>
                        <SelectItem value="closing_balance">Saldo Final</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="service_payment">Pagamento de Serviço</SelectItem>
                        <SelectItem value="product_sale">Venda de Produto</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                        <SelectItem value="tax">Taxa/Imposto</SelectItem>
                        <SelectItem value="fee">Tarifa</SelectItem>
                        <SelectItem value="refund">Reembolso</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="bank_transfer">Transferência</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>            <FormField
              control={form.control}
              name="register_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caixa</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o caixa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {registers.map((register) => (
                        <SelectItem key={register.id} value={register.id}>
                          {register.register_name} - {formatCurrency(register.current_balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite a descrição da transação..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Referência (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: NF-123456, REC-789"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Criando...' : 'Criar Transação'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
