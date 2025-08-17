import {
  BarChart3,
  Calendar,
  FileText,
  Heart,
  Shield,
  Star,
  Stethoscope,
  Users,
} from 'lucide-react';
import Image, { type ImageProps } from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Props = Omit<ImageProps, 'src'> & {
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
            <span className="block text-blue-600 dark:text-blue-400">
              Clínicas de Estética
            </span>
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transforme sua clínica com tecnologia moderna. Agendamentos
            inteligentes, prontuários eletrônicos e compliance total com LGPD,
            ANVISA e CFM.
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
                Sistema avançado de agendamentos com lembretes automáticos,
                gestão de filas de espera e integração com calendários.
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
                Prontuários digitais seguros com histórico completo, anexos de
                imagens e total compliance com regulamentações médicas.
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
                Conformidade completa com LGPD, ANVISA e CFM. Auditoria
                automática e relatórios de conformidade.
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
                Cadastro completo de pacientes com histórico médico,
                preferências e sistema de comunicação integrado.
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
                Relatórios financeiros, análise de performance e insights para
                otimização da sua clínica.
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
                Interface moderna e intuitiva, otimizada para profissionais da
                saúde e estética.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para Transformar sua Clínica?
          </h3>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de clínicas que já confiam no NeonPro para
            gerenciar seus negócios com eficiência e segurança.
          </p>
          <Button size="lg" variant="secondary">
            Começar Gratuitamente
          </Button>
        </div>
      </section>
    </div>
  );
}
