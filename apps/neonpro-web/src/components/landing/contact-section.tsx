"use client";

import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Input } from "@/components/ui/input";
import type { Textarea } from "@/components/ui/textarea";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { useForm } from "react-hook-form";
import type { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { useState } from "react";
import type {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Calendar,
  Users,
  Shield,
  CheckCircle,
  Heart,
  Headphones,
  Video,
  FileText,
  Send,
} from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  clinic: z.string().min(2, "Nome da clínica é obrigatório"),
  specialty: z.string().min(1, "Selecione uma especialidade"),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const specialties = [
  "Harmonização Facial",
  "Dermatologia Estética",
  "Cirurgia Plástica",
  "Medicina Estética",
  "Tricologia",
  "Podologia",
  "Fisioterapia Dermato-Funcional",
  "Biomedicina Estética",
  "Odontologia Estética",
  "Outro",
];

const contactMethods = [
  {
    icon: Phone,
    title: "Telefone Comercial",
    value: "(11) 3000-4000",
    description: "Seg-Sex, 8h às 18h",
    action: "tel:+551130004000",
    actionText: "Ligar Agora",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Business",
    value: "(11) 99999-8888",
    description: "Atendimento 24/7",
    action: "https://wa.me/5511999998888",
    actionText: "Conversar",
  },
  {
    icon: Mail,
    title: "Email Comercial",
    value: "vendas@neonpro.com.br",
    description: "Resposta em até 2 horas",
    action: "mailto:vendas@neonpro.com.br",
    actionText: "Enviar Email",
  },
  {
    icon: Video,
    title: "Demonstração Online",
    value: "Agende uma demo",
    description: "30 minutos personalizados",
    action: "#demo",
    actionText: "Agendar Demo",
  },
];

const offices = [
  {
    city: "São Paulo - Matriz",
    address: "Av. Paulista, 1000 - 15º andar\nBela Vista, São Paulo - SP\nCEP: 01310-100",
    phone: "(11) 3000-4000",
    hours: "Seg-Sex: 8h às 18h",
  },
  {
    city: "Rio de Janeiro",
    address: "Av. Copacabana, 500 - 8º andar\nCopacabana, Rio de Janeiro - RJ\nCEP: 22070-001",
    phone: "(21) 3000-4000",
    hours: "Seg-Sex: 9h às 17h",
  },
  {
    city: "Belo Horizonte",
    address:
      "Av. do Contorno, 300 - 12º andar\nSanto Agostinho, Belo Horizonte - MG\nCEP: 30112-000",
    phone: "(31) 3000-4000",
    hours: "Seg-Sex: 8h às 17h",
  },
];

const supportServices = [
  {
    icon: Headphones,
    title: "Suporte Técnico 24/7",
    description: "Equipe especializada sempre disponível",
  },
  {
    icon: Users,
    title: "Treinamento Completo",
    description: "Capacitação da sua equipe inclusa",
  },
  {
    icon: FileText,
    title: "Migração de Dados",
    description: "Transferência gratuita do seu sistema atual",
  },
  {
    icon: Shield,
    title: "Garantia de Compliance",
    description: "100% conforme LGPD, ANVISA e CFM",
  },
];

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      clinic: "",
      specialty: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmitSuccess(true);
      form.reset();

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      form.setError("root", {
        message: "Erro ao enviar mensagem. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20">
          <Heart className="h-3 w-3 mr-1" />
          Entre em Contato
        </Badge>

        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          Vamos Revolucionar sua{" "}
          <span className="bg-gradient-to-r from-[#6366f1] to-purple-600 bg-clip-text text-transparent">
            Clínica Estética Juntos
          </span>
        </h2>

        <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
          Nossa equipe de especialistas está pronta para desenhar a solução perfeita para sua
          clínica. Fale conosco e descubra como podemos transformar seus resultados.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Contact Form */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
              <Send className="h-6 w-6 text-[#6366f1] mr-3" />
              Solicite uma Proposta Personalizada
            </CardTitle>
            <p className="text-slate-600">
              Preencha o formulário e receba uma proposta sob medida para sua clínica
            </p>
          </CardHeader>

          <CardContent>
            {submitSuccess ? (
              <div className="text-center py-12 space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Mensagem Enviada com Sucesso!
                </h3>
                <p className="text-slate-600">
                  Nossa equipe entrará em contato em até 2 horas úteis.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Dr(a). Seu Nome"
                              className="h-12"
                              disabled={isSubmitting}
                            />
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
                          <FormLabel>Email Profissional *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="seu@email.com"
                              className="h-12"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="(11) 99999-9999"
                              className="h-12"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clinic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Clínica *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Clínica Estética..."
                              className="h-12"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidade Principal *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Selecione sua especialidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conte-nos sobre sua clínica *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Descreva sua clínica, principais desafios e objetivos..."
                            className="min-h-[120px] resize-none"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.formState.errors.root && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-600 font-medium">
                        {form.formState.errors.root.message}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 bg-[#6366f1] hover:bg-[#5855eb] text-white font-semibold shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Solicitar Proposta Gratuita
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-8">
          {/* Contact Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-[#6366f1]/30"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#6366f1] to-purple-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <method.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">{method.title}</h4>
                    <p className="text-lg font-medium text-[#6366f1] mb-1">{method.value}</p>
                    <p className="text-sm text-slate-600 mb-3">{method.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1] hover:text-white"
                      asChild
                    >
                      <a href={method.action}>{method.actionText}</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Support Services */}
          <Card className="bg-gradient-to-br from-[#6366f1]/5 to-purple-500/5 border-[#6366f1]/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">
                Suporte Completo Incluído
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {supportServices.map((service, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-[#6366f1] flex items-center justify-center flex-shrink-0 mt-1">
                    <service.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900">{service.title}</h5>
                    <p className="text-sm text-slate-600">{service.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Office Locations */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">Nossos Escritórios</h3>

        <div className="grid md:grid-cols-3 gap-6">
          {offices.map((office, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#6366f1] to-purple-600 flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-white" />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">{office.city}</h4>
                  <p className="text-sm text-slate-600 mb-3 whitespace-pre-line">
                    {office.address}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center text-sm text-slate-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {office.phone}
                    </div>
                    <div className="flex items-center justify-center text-sm text-slate-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {office.hours}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="text-center bg-slate-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Suporte de Emergência 24/7</h3>
        <p className="text-slate-700 mb-6">
          Para questões técnicas urgentes fora do horário comercial
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
            asChild
          >
            <a href="tel:+5511999997777">
              <Phone className="h-4 w-4 mr-2" />
              (11) 99999-7777
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
            asChild
          >
            <a href="mailto:emergencia@neonpro.com.br">
              <Mail className="h-4 w-4 mr-2" />
              emergencia@neonpro.com.br
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
