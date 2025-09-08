import { Button, } from '@/components/ui/button'
import {
  Card,
  /* CardContent, */ CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card' // CardContent unused import
import { BarChart3, Calendar, Lock, Shield, Stethoscope, Users, } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 healthcare-gradient bg-clip-text text-transparent">
          NeonPro Healthcare AI
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Plataforma completa de gestão para clínicas de estética com inteligência artificial
          integrada e compliance LGPD nativo.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Acessar Plataforma</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/register">Cadastrar Clínica</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="healthcare-card">
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Gestão de Pacientes</CardTitle>
            <CardDescription>
              Sistema completo com histórico, agendamentos e controle de consentimentos LGPD
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="healthcare-card">
          <CardHeader>
            <Calendar className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Agendamento Inteligente</CardTitle>
            <CardDescription>
              IA anti-no-show com predição de faltosos e otimização automática de agenda
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="healthcare-card">
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Compliance LGPD</CardTitle>
            <CardDescription>
              Proteção automática de dados pessoais com auditoria e relatórios de conformidade
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="healthcare-card">
          <CardHeader>
            <BarChart3 className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Analytics Avançado</CardTitle>
            <CardDescription>
              Dashboards inteligentes com insights de performance e crescimento da clínica
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="healthcare-card">
          <CardHeader>
            <Stethoscope className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Gestão Clínica</CardTitle>
            <CardDescription>
              Controle completo de procedimentos, profissionais e equipamentos
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="healthcare-card">
          <CardHeader>
            <Lock className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Segurança Máxima</CardTitle>
            <CardDescription>
              Criptografia ponta-a-ponta e logs de auditoria para máxima segurança
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 bg-muted rounded-lg">
        <h2 className="text-3xl font-bold mb-4">
          Pronto para revolucionar sua clínica?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Junte-se a centenas de profissionais que já transformaram sua gestão com a NeonPro.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">Começar Agora - Grátis</Link>
        </Button>
      </section>
    </div>
  )
}
