// Stock Alerts Client Component
// Story 11.4: Alertas e Relatórios de Estoque
// Cliente para gerenciar state e interações da página de alertas

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import AlertList from '@/components/stock/alert-list';
import AlertConfigForm from '@/components/stock/alert-config-form';
import {
  StockAlertConfig,
  StockAlert,
  CreateStockAlertConfigRequest,
  StockAlertError
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

interface StockAlertsState {
  configs: StockAlertConfig[];
  alerts: StockAlert[];
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

const StockAlertsClient: React.FC = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // =====================================================
  // STATE MANAGEMENT
  // =====================================================

  const [state, setState] = useState<StockAlertsState>({
    configs: [],
    alerts: [],
    products: [],
    categories: [],
    loading: true,
    error: null
  });

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    editingConfig?: StockAlertConfig;
  }>({
    isOpen: false,
    mode: 'create'
  });

  const [formLoading, setFormLoading] = useState(false);

  // =====================================================
  // DATA FETCHING
  // =====================================================

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch all data in parallel
      const [configsRes, alertsRes, productsRes, categoriesRes] = await Promise.all([
        fetch('/api/stock/alerts', { method: 'GET' }),
        fetch('/api/stock/alerts/active', { method: 'GET' }),
        fetch('/api/stock/products?limit=1000', { method: 'GET' }),
        fetch('/api/stock/categories?limit=1000', { method: 'GET' })
      ]);

      // Check for errors
      if (!configsRes.ok || !alertsRes.ok || !productsRes.ok || !categoriesRes.ok) {
        throw new Error('Falha ao carregar dados');
      }

      // Parse responses
      const [configsData, alertsData, productsData, categoriesData] = await Promise.all([
        configsRes.json(),
        alertsRes.json(),
        productsRes.json(),
        categoriesRes.json()
      ]);

      setState(prev => ({
        ...prev,
        configs: configsData.configs || [],
        alerts: alertsData.alerts || [],
        products: productsData.products || [],
        categories: categoriesData.categories || [],
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleCreateNew = () => {
    setDialogState({
      isOpen: true,
      mode: 'create'
    });
  };

  const handleEdit = (config: StockAlertConfig) => {
    setDialogState({
      isOpen: true,
      mode: 'edit',
      editingConfig: config
    });
  };

  const handleCloseDialog = () => {
    setDialogState({
      isOpen: false,
      mode: 'create'
    });
  };

  const handleSubmitConfig = async (data: CreateStockAlertConfigRequest) => {
    setFormLoading(true);

    try {
      const url = dialogState.mode === 'edit' && dialogState.editingConfig
        ? `/api/stock/alerts/${dialogState.editingConfig.id}`
        : '/api/stock/alerts';

      const method = dialogState.mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new StockAlertError(
          errorData.message || 'Falha ao salvar configuração',
          errorData.code || 'SAVE_FAILED'
        );
      }

      // Success
      toast({
        title: "Sucesso",
        description: dialogState.mode === 'edit' 
          ? "Configuração atualizada com sucesso"
          : "Configuração criada com sucesso",
      });

      handleCloseDialog();
      await fetchData(); // Refresh data

    } catch (error) {
      if (error instanceof StockAlertError) {
        throw error; // Let the form handle it
      } else {
        throw new StockAlertError('Erro interno do servidor', 'INTERNAL_ERROR');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    try {
      const response = await fetch(`/api/stock/alerts/${configId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao excluir configuração');
      }

      toast({
        title: "Sucesso",
        description: "Configuração excluída com sucesso",
      });

      await fetchData(); // Refresh data

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleToggleActive = async (configId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/stock/alerts/${configId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar configuração');
      }

      toast({
        title: "Sucesso",
        description: `Configuração ${isActive ? 'ativada' : 'desativada'} com sucesso`,
      });

      await fetchData(); // Refresh data

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/stock/alerts/acknowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao confirmar alerta');
      }

      toast({
        title: "Sucesso",
        description: "Alerta confirmado com sucesso",
      });

      await fetchData(); // Refresh data

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertList
        configs={state.configs}
        alerts={state.alerts}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDelete={handleDeleteConfig}
        onToggleActive={handleToggleActive}
        onAcknowledge={handleAcknowledgeAlert}
        onRefresh={fetchData}
        loading={state.loading}
      />

      <Dialog open={dialogState.isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogState.mode === 'edit' ? 'Editar Configuração' : 'Nova Configuração'}
            </DialogTitle>
          </DialogHeader>
          <AlertConfigForm
            onSubmit={handleSubmitConfig}
            onCancel={handleCloseDialog}
            initialData={dialogState.editingConfig}
            products={state.products}
            categories={state.categories}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StockAlertsClient;