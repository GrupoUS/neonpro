import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionForm from '@/components/transactions/TransactionForm';
import { Transacao, CreateTransacaoData } from '@/types/transaction';

const Financeiro: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null);
  const { toast } = useToast();

  const {
    transacoes: transactions,
    loading: isLoading,
    createTransacao: createTransaction,
    updateTransacao: updateTransaction,
    deleteTransacao: deleteTransaction
  } = useTransactions();

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (transaction: Transacao) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        const success = await deleteTransaction(id);
        if (success) {
          toast({
            title: "Sucesso",
            description: "Transação excluída com sucesso!",
          });
        } else {
          throw new Error('Falha ao excluir transação');
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir transação. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmitForm = async (data: CreateTransacaoData) => {
    try {
      let success = false;
      if (editingTransaction) {
        success = await updateTransaction(editingTransaction.id, data);
        if (success) {
          toast({
            title: "Sucesso",
            description: "Transação atualizada com sucesso!",
          });
        }
      } else {
        success = await createTransaction(data);
        if (success) {
          toast({
            title: "Sucesso", 
            description: "Transação criada com sucesso!",
          });
        }
      }
      
      if (success) {
        setIsFormOpen(false);
        setEditingTransaction(null);
      } else {
        throw new Error('Falha ao salvar transação');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar transação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleExport = () => {
    // TODO: Implementar exportação de dados
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de exportação será implementada em breve.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Controle de receitas, despesas e fluxo de caixa
          </p>
        </div>
        <Button onClick={handleAddTransaction}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={transactions || []}
        isLoading={isLoading}
        onAdd={handleAddTransaction}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onExport={handleExport}
      />

      {/* Transaction Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Financeiro;
