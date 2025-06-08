import { createClient } from '@/lib/client';
import { Cliente, CreateClienteData, UpdateClienteData } from '@/lib/types/cliente';

export class ClientesService {
  private supabase = createClient();

  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await this.supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar clientes: ${error.message}`);
    }

    return data || [];
  }

  async getClienteById(id: string): Promise<Cliente | null> {
    const { data, error } = await this.supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Cliente não encontrado
      }
      throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }

    return data;
  }

  async createCliente(clienteData: CreateClienteData): Promise<Cliente> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await this.supabase
      .from('clientes')
      .insert({
        ...clienteData,
        user_id: user.id,
        status: clienteData.status || 'ativo'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar cliente: ${error.message}`);
    }

    return data;
  }

  async updateCliente(updateData: UpdateClienteData): Promise<Cliente> {
    const { id, ...clienteData } = updateData;
    
    const { data, error } = await this.supabase
      .from('clientes')
      .update(clienteData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar cliente: ${error.message}`);
    }

    return data;
  }

  async deleteCliente(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar cliente: ${error.message}`);
    }
  }

  async searchClientes(query: string): Promise<Cliente[]> {
    const { data, error } = await this.supabase
      .from('clientes')
      .select('*')
      .or(`nome.ilike.%${query}%,email.ilike.%${query}%,telefone.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar clientes: ${error.message}`);
    }

    return data || [];
  }

  async getClientesCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Erro ao contar clientes: ${error.message}`);
    }

    return count || 0;
  }
}
