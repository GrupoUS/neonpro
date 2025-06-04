
import React from "react";
import { Client } from "@/types/database";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ClientFormProps {
  client: Client | null;
  onSave: (client: Client, isNew: boolean) => void;
  onCancel: () => void;
}

const clientSchema = z.object({
  full_name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").or(z.literal("")),
  phone: z.string().optional(),
  instagram_handle: z.string().optional(),
  birthdate: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const ClientForm: React.FC<ClientFormProps> = ({ client, onSave, onCancel }) => {
  const { user } = useAuth();
  const isNewClient = !client;

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: client?.full_name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      instagram_handle: client?.instagram_handle || "",
      birthdate: client?.birthdate ? new Date(client.birthdate).toISOString().split("T")[0] : "",
      notes: client?.notes || "",
    },
  });

  const handleSubmit = async (values: ClientFormValues) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      if (isNewClient) {
        const { data, error } = await supabase
          .from("clients")
          .insert({
            ...values,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        toast.success("Cliente criado com sucesso!");
        onSave(data as Client, true);
      } else {
        const { data, error } = await supabase
          .from("clients")
          .update(values)
          .eq("id", client.id)
          .select()
          .single();

        if (error) throw error;
        toast.success("Cliente atualizado com sucesso!");
        onSave(data as Client, false);
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast.error(`Erro ao ${isNewClient ? "criar" : "atualizar"} cliente.`);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isNewClient ? "Novo Cliente" : `Editar Cliente: ${client.full_name}`}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo*</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram_handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="@usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o cliente..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                {isNewClient ? "Criar Cliente" : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
