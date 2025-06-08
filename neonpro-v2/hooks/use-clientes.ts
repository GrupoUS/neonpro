"use client";

import { useState, useEffect, useCallback } from "react";
import { Cliente, CreateClienteData, UpdateClienteData } from "@/lib/types/cliente";
import { ClientesService } from "@/lib/services/clientes";

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const clientesService = new ClientesService();

  // Load all clients
  const loadClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesService.getClientes();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Search clients
  const searchClientes = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = query.trim() 
        ? await clientesService.searchClientes(query)
        : await clientesService.getClientes();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create client
  const createCliente = useCallback(async (clienteData: CreateClienteData): Promise<Cliente> => {
    try {
      setError(null);
      const newCliente = await clientesService.createCliente(clienteData);
      await loadClientes(); // Reload the list
      return newCliente;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadClientes]);

  // Update client
  const updateCliente = useCallback(async (updateData: UpdateClienteData): Promise<Cliente> => {
    try {
      setError(null);
      const updatedCliente = await clientesService.updateCliente(updateData);
      await loadClientes(); // Reload the list
      return updatedCliente;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadClientes]);

  // Delete client
  const deleteCliente = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await clientesService.deleteCliente(id);
      await loadClientes(); // Reload the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao deletar cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadClientes]);

  // Get client by ID
  const getClienteById = useCallback(async (id: string): Promise<Cliente | null> => {
    try {
      setError(null);
      return await clientesService.getClienteById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Search function for UI
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    searchClientes(query);
  }, [searchClientes]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    loadClientes();
  }, [loadClientes]);

  // Load clients on mount
  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  return {
    clientes,
    loading,
    error,
    searchQuery,
    search,
    clearSearch,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    refreshClientes: loadClientes,
  };
}
