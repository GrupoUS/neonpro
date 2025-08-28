import { z } from "zod";

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

// Patient schemas
export const PatientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  address: z
    .object({
      street: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
      city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
      state: z.string().length(2, "Estado deve ter 2 caracteres"),
      zipCode: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
    })
    .optional(),
});

// Appointment schemas
export const AppointmentSchema = z.object({
  patientId: z.string().uuid("ID do paciente inválido"),
  professionalId: z.string().uuid("ID do profissional inválido"),
  serviceId: z.string().uuid("ID do serviço inválido"),
  scheduledAt: z.string().datetime("Data e hora inválidas"),
  notes: z.string().optional(),
  duration: z
    .number()
    .min(15, "Duração mínima de 15 minutos")
    .max(480, "Duração máxima de 8 horas"),
});

// LGPD consent schemas
export const ConsentSchema = z.object({
  patientId: z.string().uuid("ID do paciente inválido"),
  purpose: z.enum(["DATA_PROCESSING", "MARKETING", "RESEARCH"], {
    errorMap: () => ({ message: "Finalidade inválida" }),
  }),
  granted: z.boolean(),
  grantedAt: z.string().datetime("Data e hora inválidas").optional(),
});

// Export types
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type PatientInput = z.infer<typeof PatientSchema>;
export type AppointmentInput = z.infer<typeof AppointmentSchema>;
export type ConsentInput = z.infer<typeof ConsentSchema>;
