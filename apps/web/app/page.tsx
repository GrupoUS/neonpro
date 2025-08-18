import {
  BarChart3,
  Calendar,
  FileText,
  Heart,
  Shield,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import Image, { type ImageProps } from "next/image";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@neonpro/ui";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const _ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="block dark:hidden" />
      <Image {...rest} src={srcDark} className="hidden dark:block" />
    </>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Heart className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NeonPro
            </h1>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white max-w-4xl mx-auto">
            Sistema Completo de Gestão para
            <span className="block text-blue-600 dark:text-blue-400">Clínicas de Estética</span>
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transforme sua clínica com tecnologia moderna. Agendamentos inteligentes, prontuários
            eletrônicos e compliance total com LGPD, ANVISA e CFM.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              LGPD Compliant
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Stethoscope className="h-3 w-3" />
              ANVISA
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              CFM
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Iniciar Demonstração
            </Button>
            <Button variant="outline" size="lg">
              Ver Documentação
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Recursos Principais
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Agendamentos Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sistema avançado de agendamentos com lembretes automáticos, gestão de filas de
                espera e integração com calendários.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Prontuário Eletrônico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Prontuários digitais seguros com histórico completo, anexos de imagens e total
                compliance com regulamentações médicas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Compliance Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Conformidade completa com LGPD, ANVISA e CFM. Auditoria automática e relatórios de
                conformidade.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Gestão de Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Cadastro completo de pacientes com histórico médico, preferências e sistema de
                comunicação integrado.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-pink-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-pink-600" />
                Analytics Avançado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Relatórios financeiros, análise de performance e insights para otimização da sua
                clínica.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-cyan-600" />
                Experiência Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Interface moderna e intuitiva, otimizada para profissionais da saúde e estética.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Patient Portal Demo Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Portal do Paciente
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Experiência completa para pacientes de estética com acompanhamento de tratamentos,
              agendamentos e evolução visual
            </p>
          </div>

          <PatientPortalDemo />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para Transformar sua Clínica?
          </h3>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de clínicas que já confiam no NeonPro para gerenciar seus negócios
            com eficiência e segurança.
          </p>
          <Button size="lg" variant="secondary">
            Começar Gratuitamente
          </Button>
        </div>
      </section>
    </div>
  );
}

// Patient Portal Demo Component
function PatientPortalDemo() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border">
        {/* Mobile Header Simulation */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6" />
              <span className="font-semibold">Portal do Paciente</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="h-2 w-2 bg-white rounded-full absolute -top-1 -right-1"></div>
                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">🔔</span>
                </div>
              </div>
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs">👤</span>
              </div>
            </div>
          </div>
        </div>

        {/* Portal Content */}
        <div className="p-6 space-y-6">
          {/* Welcome Message */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Boa tarde, Maria Silva! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Acompanhe seus tratamentos estéticos e próximas consultas
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-pink-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Próxima Consulta</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">25/08</p>
                    <p className="text-xs text-gray-500">Botox - 14:30</p>
                  </div>
                  <Calendar className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tratamentos Ativos</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">2</p>
                    <p className="text-xs text-gray-500">Em andamento</p>
                  </div>
                  <Heart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Progresso</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">75%</p>
                    <p className="text-xs text-gray-500">Concluído</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avaliação</p>
                    <div className="flex items-center space-x-1">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">5</p>
                      <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                    </div>
                    <p className="text-xs text-gray-500">Excelente</p>
                  </div>
                  <Star className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Treatment Progress */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span>Tratamentos Ativos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Rejuvenescimento Facial</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Botox + Preenchimento
                      </p>
                    </div>
                    <Badge variant="secondary">Em andamento</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-pink-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>3 de 4 sessões</span>
                      <span>Próxima: 25/08</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Tratamento Corporal</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Criolipólise</p>
                    </div>
                    <Badge variant="secondary">Em andamento</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>50%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "50%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>2 de 4 sessões</span>
                      <span>Próxima: 05/09</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Cuidados Pós-Tratamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-red-500"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Evitar exercícios intensos</h4>
                      <span className="text-xs text-gray-500">Hoje</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Nas próximas 24h após aplicação de Botox
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Aplicar protetor solar</h4>
                      <span className="text-xs text-gray-500">Diário</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Use FPS 60+ diariamente
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Hidratação da pele</h4>
                      <span className="text-xs text-gray-500">2x/dia</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Usar creme hidratante manhã e noite
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Before/After Photos Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Evolução dos Tratamentos</span>
              </CardTitle>
              <CardDescription>Acompanhe visualmente seus resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center space-y-2 hover:border-gray-400 transition-colors">
                  <Users className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Antes</span>
                </div>

                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center space-y-2 hover:border-gray-400 transition-colors">
                  <Users className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Depois</span>
                </div>

                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center space-y-2 hover:border-gray-400 transition-colors">
                  <Users className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Progresso</span>
                </div>

                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center space-y-2 hover:border-gray-400 transition-colors">
                  <Users className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Adicionar</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-pink-600 hover:bg-pink-700 flex-1">
              <Calendar className="h-4 w-4" />
              Agendar Nova Consulta
            </Button>
            <Button variant="outline" className="flex-1">
              <Users className="h-4 w-4" />
              Enviar Mensagem
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4" />
              Ver Histórico Completo
            </Button>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <div className="mx-auto w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-pink-600" />
          </div>
          <h4 className="font-semibold mb-2">Agendamento Inteligente</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sistema de agendamento com IA, lembretes automáticos e gestão de filas de espera
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
            <Heart className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold mb-2">Jornada de Tratamento</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Acompanhamento completo com fotos antes/depois, marcos de progresso e evolução visual
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold mb-2">Comunicação Segura</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chat seguro com a clínica, notificações e suporte de emergência 24/7
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold mb-2">Educação e Cuidados</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Conteúdo educativo, instruções de cuidados pós-tratamento e vídeos tutoriais
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <h4 className="font-semibold mb-2">Pagamentos Brasileiros</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Integração com PIX, cartões e parcelamento com gestão financeira completa
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="mx-auto w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center mb-4">
            <Stethoscope className="h-6 w-6 text-cyan-600" />
          </div>
          <h4 className="font-semibold mb-2">Compliance Total</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Conformidade completa com LGPD, ANVISA e CFM para máxima segurança
          </p>
        </Card>
      </div>
    </div>
  );
}
