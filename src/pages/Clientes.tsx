
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import ClientForm from "@/components/clients/ClientForm";
import ClientDetails from "@/components/clients/ClientDetails";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

const ClientesPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("full_name");

      if (error) throw error;
      setClients(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao carregar clientes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentClient(null);
    setShowForm(true);
  };

  const handleEdit = (client: Client) => {
    setCurrentClient(client);
    setShowForm(true);
  };

  const handleView = (client: Client) => {
    setCurrentClient(client);
    setShowDetails(true);
  };

  const handleDelete = (client: Client) => {
    setCurrentClient(client);
    setConfirmDelete(true);
  };

  const confirmDeleteClient = async () => {
    if (!currentClient) return;
    
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", currentClient.id);

      if (error) throw error;
      
      setClients(clients.filter(c => c.id !== currentClient.id));
      toast.success("Cliente excluído com sucesso!");
      setConfirmDelete(false);
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast.error("Erro ao excluir cliente.");
    }
  };

  const handleSave = (client: Client, isNew: boolean) => {
    if (isNew) {
      setClients([...clients, client]);
    } else {
      setClients(clients.map(c => c.id === client.id ? client : c));
    }
    setShowForm(false);
  };

  const filteredClients = clients.filter(client => 
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  return (
    <div className="p-6">
      <Helmet>
        <title>Clientes | NEON PRO</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar por nome, email ou telefone..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.full_name}</TableCell>
                    <TableCell>{client.email || "-"}</TableCell>
                    <TableCell>{client.phone || "-"}</TableCell>
                    <TableCell>{client.instagram_handle || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(client)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(client)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {showForm && (
        <ClientForm 
          client={currentClient} 
          onSave={handleSave} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      {showDetails && currentClient && (
        <ClientDetails 
          client={currentClient} 
          onClose={() => setShowDetails(false)}
          onEdit={() => {
            setShowDetails(false);
            setShowForm(true);
          }}
        />
      )}

      <DeleteConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteClient}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${currentClient?.full_name}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default ClientesPage;
