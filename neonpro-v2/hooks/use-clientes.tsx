'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cliente, CreateClienteData, UpdateClienteData } from '@/lib/types/cliente';
import { ClientesService } from '@/lib/services/clientes';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const clientesService = new ClientesService();

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = searchQuery 
        ? await clientesService.searchClientes(searchQuery)
        : await clientesService.getClientes();
      
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const createCliente = async (clienteData: CreateClienteData): Promise<Cliente> => {
    try {
      setError(null);
      const newCliente = await clientesService.createCliente(clienteData);
      setClientes(prev => [newCliente, ...prev]);
      return newCliente;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cliente';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCliente = async (updateData: UpdateClienteData): Promise<Cliente> => {
    try {
      setError(null);
      const updatedCliente = await clientesService.updateCliente(updateData);
      setClientes(prev => 
        prev.map(cliente => 
          cliente.id === updateData.id ? updatedCliente : cliente
        )
      );
      return updatedCliente;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCliente = async (id: string): Promise<void> => {
    try {
      setError(null);
      await clientesService.deleteCliente(id);
      setClientes(prev => prev.filter(cliente => cliente.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar cliente';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getClienteById = async (id: string): Promise<Cliente | null> => {
    try {
      setError(null);
      return await clientesService.getClienteById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar cliente';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const search = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return {
    clientes,
    loading,
    error,
    searchQuery,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    search,
    clearSearch,
    refresh: fetchClientes
  };
}
