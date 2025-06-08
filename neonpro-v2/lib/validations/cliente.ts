import { z } from "zod";

// Validation schema for client data
export const clienteSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),

  email: z
    .string()
    .email("Email deve ter um formato válido")
    .max(255, "Email deve ter no máximo 255 caracteres")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .max(20, "Telefone deve ter no máximo 20 caracteres")
    .optional()
    .or(z.literal("")),

  birth_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 120, 0, 1);
      return parsedDate <= today && parsedDate >= minDate;
    }, "Data de nascimento deve ser válida"),

  address: z
    .string()
    .max(500, "Endereço deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(1000, "Observações devem ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),

  is_active: z.boolean().optional().default(true),
});

// Schema for creating a new client
export const createClienteSchema = clienteSchema;

// Schema for updating an existing client (all fields optional except name)
export const updateClienteSchema = clienteSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim()
    .optional(),
});

// Type inference from schemas
export type ClienteFormData = z.infer<typeof clienteSchema>;
export type CreateClienteFormData = z.infer<typeof createClienteSchema>;
export type UpdateClienteFormData = z.infer<typeof updateClienteSchema>;

// Helper function to transform form data to API format
export function transformFormDataToApi(data: ClienteFormData) {
  return {
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    birth_date: data.birth_date || null,
    address: data.address || null,
    notes: data.notes || null,
    is_active: data.is_active,
  };
}

// Helper function to transform API data to form format
export function transformApiDataToForm(data: {
  name?: string;
  email?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  address?: string | null;
  notes?: string | null;
  is_active?: boolean;
}): ClienteFormData {
  return {
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    birth_date: data.birth_date || "",
    address: data.address || "",
    notes: data.notes || "",
    is_active: data.is_active ?? true,
  };
}
