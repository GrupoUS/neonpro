"use client";

import type { useState } from "react";
import type { useForm } from "react-hook-form";
import type { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Button } from "@/components/ui/button";
import type {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Textarea } from "@/components/ui/textarea";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Separator } from "@/components/ui/separator";
import type {
  MessageSquare,
  Phone,
  Mail,
  User,
  Calendar,
  Clock,
  Send,
  ExternalLink,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import type { toast } from "sonner";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { Appointment } from "@/hooks/use-appointments-manager";

// Form validation schema
const contactSchema = z.object({
  contact_method: z.enum(["whatsapp", "sms", "email", "phone"]),
  message_template: z.string().optional(),
  custom_message: z.string().min(1, "Mensagem é obrigatória"),
  send_appointment_details: z.boolean().default(true),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactPatientDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactPatientDialog({
  appointment,
  open,
  onOpenChange,
}: ContactPatientDialogProps) {
  const [isSending, setIsSending] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contact_method: "whatsapp",
      message_template: "",
      custom_message: "",
      send_appointment_details: true,
    },
  });

  // Message templates
  const messageTemplates = {
    reminder: `Olá {patient_name}! Este é um lembrete do seu agendamento para {service_name} no dia {date} às {time}. Nos vemos em breve!`,
    confirmation: `Olá {patient_name}! Seu agendamento para {service_name} no dia {date} às {time} foi confirmado. Aguardamos você!`,
    rescheduling: `Olá {patient_name}! Precisamos reagendar seu agendamento de {service_name} que estava marcado para {date} às {time}. Entre em contato conosco para marcar uma nova data.`,
    cancellation: `Olá {patient_name}! Infelizmente precisamos cancelar seu agendamento de {service_name} no dia {date} às {time}. Entre em contato conosco para remarcar.`,
    followup: `Olá {patient_name}! Como foi sua experiência com nosso serviço de {service_name}? Sua opinião é muito importante para nós!`,
    custom: "",
  };

  // Replace template variables with actual data
  const replaceTemplateVariables = (template: string) => {
    if (!appointment) return template;

    const replacements: Record<string, string> = {
      "{patient_name}": appointment.patient?.full_name || "Paciente",
      "{service_name}": appointment.service?.name || "Serviço",
      "{date}": format(new Date(appointment.start_time), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      }),
      "{time}": format(new Date(appointment.start_time), "HH:mm", { locale: ptBR }),
      "{professional}": appointment.professional?.full_name || "Profissional",
    };

    let result = template;
    Object.entries(replacements).forEach(([key, value]) => {
      result = result.replace(new RegExp(key, "g"), value);
    });

    return result;
  };

  // Handle template selection
  const handleTemplateChange = (templateKey: string) => {
    const template = messageTemplates[templateKey as keyof typeof messageTemplates];
    if (template) {
      const processedMessage = replaceTemplateVariables(template);
      form.setValue("custom_message", processedMessage);
    }
  };

  // Handle contact method specific actions
  const handleDirectContact = async (method: "phone" | "whatsapp" | "email") => {
    if (!appointment?.patient) return;

    const patient = appointment.patient;

    switch (method) {
      case "phone":
        if (patient.phone) {
          window.open(`tel:${patient.phone}`);
        } else {
          toast.error("Paciente não possui telefone cadastrado");
        }
        break;

      case "whatsapp":
        if (patient.phone) {
          const message = encodeURIComponent(form.getValues("custom_message"));
          const whatsappUrl = `https://wa.me/55${patient.phone.replace(/\D/g, "")}?text=${message}`;
          window.open(whatsappUrl, "_blank");
        } else {
          toast.error("Paciente não possui telefone cadastrado");
        }
        break;

      case "email":
        if (patient.email) {
          const subject = encodeURIComponent(`Agendamento - ${appointment.service?.name}`);
          const body = encodeURIComponent(form.getValues("custom_message"));
          window.open(`mailto:${patient.email}?subject=${subject}&body=${body}`);
        } else {
          toast.error("Paciente não possui email cadastrado");
        }
        break;
    }
  };

  // Copy contact info to clipboard
  const copyToClipboard = async (text: string, type: "phone" | "email") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "phone") {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      } else {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
      toast.success("Copiado para a área de transferência!");
    } catch (error) {
      toast.error("Erro ao copiar para área de transferência");
    }
  };

  // Handle form submission (for scheduled/tracked contacts)
  const onSubmit = async (data: ContactFormData) => {
    if (!appointment) return;

    try {
      setIsSending(true);

      // For WhatsApp, open direct link
      if (data.contact_method === "whatsapp") {
        handleDirectContact("whatsapp");
        toast.success("WhatsApp aberto! Mensagem pronta para envio.");
        onOpenChange(false);
        return;
      }

      // For other methods, log the contact attempt (you can implement API call here)
      const contactData = {
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        contact_method: data.contact_method,
        message: data.custom_message,
        sent_at: new Date().toISOString(),
      };

      // TODO: Implement API call to log contact
      console.log("Contact logged:", contactData);

      // Open appropriate contact method
      switch (data.contact_method) {
        case "email":
          handleDirectContact("email");
          break;
        case "phone":
          handleDirectContact("phone");
          break;
        case "sms":
          // TODO: Implement SMS API integration
          toast.info("Funcionalidade de SMS será implementada em breve");
          break;
      }

      toast.success("Contato realizado com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending contact:", error);
      toast.error("Erro ao realizar contato");
    } finally {
      setIsSending(false);
    }
  };

  if (!appointment) return null;

  const patient = appointment.patient;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contatar Paciente
          </DialogTitle>
          <DialogDescription>
            Entre em contato com {patient?.full_name} sobre o agendamento
          </DialogDescription>
        </DialogHeader>

        {/* Patient and Appointment Info */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Informações do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient?.phone || "Não informado"}</span>
                </div>
                {patient?.phone && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(patient.phone!, "phone")}
                    >
                      {copiedPhone ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDirectContact("phone")}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient?.email || "Não informado"}</span>
                </div>
                {patient?.email && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(patient.email!, "email")}
                    >
                      {copiedEmail ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDirectContact("email")}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(appointment.start_time), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(appointment.start_time), "HH:mm", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {appointment.service?.name || "Serviço não especificado"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Contact Method */}
            <FormField
              control={form.control}
              name="contact_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Contato</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="phone">Ligação</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message Template */}
            <div className="space-y-2">
              <FormLabel>Template de Mensagem</FormLabel>
              <Select onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um template ou escreva uma mensagem personalizada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">Lembrete de agendamento</SelectItem>
                  <SelectItem value="confirmation">Confirmação de agendamento</SelectItem>
                  <SelectItem value="rescheduling">Reagendamento necessário</SelectItem>
                  <SelectItem value="cancellation">Cancelamento</SelectItem>
                  <SelectItem value="followup">Follow-up pós-atendimento</SelectItem>
                  <SelectItem value="custom">Mensagem personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Message */}
            <FormField
              control={form.control}
              name="custom_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite sua mensagem aqui..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSending || (!patient?.phone && !patient?.email)}>
                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                {form.watch("contact_method") === "whatsapp"
                  ? "Abrir WhatsApp"
                  : form.watch("contact_method") === "phone"
                    ? "Fazer Ligação"
                    : form.watch("contact_method") === "email"
                      ? "Abrir Email"
                      : "Enviar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
