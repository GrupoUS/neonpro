// components/landing/demo-request.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  Zap,
  CheckCircle,
  Clock,
  Award,
  MessageSquare
} from "lucide-react";

export function DemoRequest() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    clinicName: "",
    city: "",
    state: "",
    clinicType: "",
    currentPatients: "",
    currentSystem: "",
    painPoints: "",
    bestTime: "",
    gdprConsent: false,
    marketingConsent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const benefits = [
    {
      icon: Calendar,
      title: "Demo Personalizada",
      description: "Demonstração focada no seu tipo de clínica"
    },
    {
      icon: Zap,
      title: "Setup em 24h",
      description: "Implementação rápida e suporte completo"
    },
    {
      icon: Award,
      title: "Treinamento Incluso",
      description: "Capacitação da equipe sem custo adicional"
    },
    {
      icon: Clock,
      title: "30 Dias Grátis",
      description: "Teste completo sem compromisso"
    }
  ];

  const states = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  if (isSubmitted) {
    return (
      <section id="demo" className="py-16 lg:py-24 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Solicitação Recebida com Sucesso!
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Nossa equipe entrará em contato em até 2 horas úteis para agendar sua demonstração personalizada.
            </p>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Próximos Passos:
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">1</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Verificação das suas necessidades específicas
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">2</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Demonstração personalizada de 30 minutos
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">3</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Proposta personalizada e período de teste
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="demo" className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
            Demonstração Gratuita
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Veja o NeonPro em Ação
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Agende uma demonstração personalizada e descubra como nossa plataforma pode 
            transformar sua clínica em apenas 30 minutos.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Benefits Column */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              O que você terá:
            </h3>
            
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900 flex-shrink-0">
                  <benefit.icon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Contact Info */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950">
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Prefere falar conosco?
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-sky-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      (11) 4005-2030
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      WhatsApp: (11) 99999-0000
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      contato@neonpro.health
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 dark:text-white">
                  Solicitar Demonstração
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400">
                  Preencha os dados abaixo e nossa equipe entrará em contato em até 2 horas úteis.
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        placeholder="Dr. João Silva"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail Profissional *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        placeholder="joao@clinica.com.br"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        placeholder="(11) 99999-0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bestTime">Melhor Horário</Label>
                      <Select onValueChange={(value) => handleInputChange('bestTime', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o horário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Manhã (9h-12h)</SelectItem>
                          <SelectItem value="afternoon">Tarde (13h-17h)</SelectItem>
                          <SelectItem value="evening">Noite (18h-20h)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Clinic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clinicName">Nome da Clínica *</Label>
                      <Input
                        id="clinicName"
                        type="text"
                        value={formData.clinicName}
                        onChange={(e) => handleInputChange('clinicName', e.target.value)}
                        required
                        placeholder="Clínica Bella Vita"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clinicType">Tipo de Clínica *</Label>
                      <Select onValueChange={(value) => handleInputChange('clinicType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aesthetic">Estética</SelectItem>
                          <SelectItem value="dermatology">Dermatologia</SelectItem>
                          <SelectItem value="plastic-surgery">Cirurgia Plástica</SelectItem>
                          <SelectItem value="beauty">Beleza e Bem-estar</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                        placeholder="São Paulo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado *</Label>
                      <Select onValueChange={(value) => handleInputChange('state', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentPatients">Pacientes/Mês</Label>
                      <Select onValueChange={(value) => handleInputChange('currentPatients', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Quantidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-100">0-100</SelectItem>
                          <SelectItem value="100-500">100-500</SelectItem>
                          <SelectItem value="500-1000">500-1000</SelectItem>
                          <SelectItem value="1000+">1000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="painPoints">Principais Desafios (Opcional)</Label>
                    <Textarea
                      id="painPoints"
                      value={formData.painPoints}
                      onChange={(e) => handleInputChange('painPoints', e.target.value)}
                      placeholder="Ex: conflitos de agenda, dificuldade com compliance, relatórios manuais..."
                      rows={3}
                    />
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="gdprConsent"
                        checked={formData.gdprConsent}
                        onCheckedChange={(checked) => handleInputChange('gdprConsent', checked as boolean)}
                        required
                      />
                      <Label htmlFor="gdprConsent" className="text-sm leading-5">
                        Concordo com o processamento dos meus dados conforme a{' '}
                        <a href="#" className="text-sky-600 hover:underline">
                          Política de Privacidade
                        </a>{' '}
                        e{' '}
                        <a href="#" className="text-sky-600 hover:underline">
                          Termos de Uso
                        </a>
                        . (LGPD) *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="marketingConsent"
                        checked={formData.marketingConsent}
                        onCheckedChange={(checked) => handleInputChange('marketingConsent', checked as boolean)}
                      />
                      <Label htmlFor="marketingConsent" className="text-sm leading-5">
                        Aceito receber comunicações sobre produtos, serviços e conteúdos relevantes do NeonPro.
                      </Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.gdprConsent}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 text-base font-semibold"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando Solicitação...
                      </>
                    ) : (
                      <>
                        Solicitar Demonstração Gratuita
                        <Calendar className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    * Campos obrigatórios. Resposta em até 2 horas úteis.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
