// app/page.tsx - NeonPro Healthcare Landing Page
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { ContactSection } from "@/components/landing/contact-section";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Calendar, BarChart3, Heart, CheckCircle } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeAuthForm, setActiveAuthForm] = useState<'login' | 'register' | null>(null);
  const [loginType, setLoginType] = useState<'professional' | 'patient'>('professional');

  // Handle authenticated users - redirect to appropriate dashboard
  useEffect(() => {
    if (!loading && user) {
      // Check user role and redirect appropriately
      const userRole = user.user_metadata?.role || 'patient';
      
      if (userRole === 'patient') {
        router.push('/patient-portal');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Show loading state for authenticated users
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando NeonPro...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <main className="min-h-screen bg-[#e7e5e4]">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6366f1] shadow-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-900">NeonPro</span>
                  <Badge variant="secondary" className="text-xs w-fit">
                    Clínicas Estéticas
                  </Badge>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-8">
                <a
                  href="#features"
                  className="text-sm font-medium text-slate-700 hover:text-[#6366f1] transition-colors"
                >
                  Recursos
                </a>
                <a
                  href="#testimonials"
                  className="text-sm font-medium text-slate-700 hover:text-[#6366f1] transition-colors"
                >
                  Depoimentos
                </a>
                <a
                  href="#compliance"
                  className="text-sm font-medium text-slate-700 hover:text-[#6366f1] transition-colors"
                >
                  Compliance
                </a>
                <a
                  href="#contact"
                  className="text-sm font-medium text-slate-700 hover:text-[#6366f1] transition-colors"
                >
                  Contato
                </a>
              </nav>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLoginType('patient');
                    setActiveAuthForm('login');
                  }}
                  className="text-slate-700 hover:text-[#6366f1] hover:bg-[#6366f1]/10"
                >
                  Portal do Paciente
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setLoginType('professional');
                    setActiveAuthForm('login');
                  }}
                  className="bg-[#6366f1] hover:bg-[#5855eb] text-white shadow-md"
                >
                  Acesso Profissional
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-0">
          {/* Hero Section */}
          <HeroSection
            onLoginClick={() => {
              setLoginType('professional');
              setActiveAuthForm('login');
            }}
            onRegisterClick={() => {
              setLoginType('patient');
              setActiveAuthForm('register');
            }}
          />

          {/* Features Section */}
          <section id="features" className="py-16 bg-white">
            <FeaturesSection />
          </section>

          {/* Compliance Section */}
          <section id="compliance" className="py-16 bg-[#e7e5e4]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Conformidade Total com Regulamentações Brasileiras
                </h2>
                <p className="text-lg text-slate-700 max-w-3xl mx-auto">
                  Sistema desenvolvido para atender integralmente às exigências da LGPD, ANVISA e CFM, 
                  garantindo segurança e compliance para sua clínica estética.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-white border-l-4 border-l-[#6366f1]">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Shield className="h-8 w-8 text-[#6366f1] mr-3" />
                      <h3 className="text-xl font-semibold text-slate-900">LGPD</h3>
                    </div>
                    <p className="text-slate-700">
                      Gestão completa de consentimentos e dados pessoais dos pacientes, 
                      com auditoria automática e relatórios de compliance.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                      <h3 className="text-xl font-semibold text-slate-900">ANVISA</h3>
                    </div>
                    <p className="text-slate-700">
                      Controle de procedimentos estéticos, rastreabilidade de produtos 
                      e relatórios automáticos para fiscalizações.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Users className="h-8 w-8 text-blue-500 mr-3" />
                      <h3 className="text-xl font-semibold text-slate-900">CFM</h3>
                    </div>
                    <p className="text-slate-700">
                      Prontuário eletrônico certificado, assinatura digital e 
                      conformidade com resoluções médicas atuais.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Authentication Section */}
          {activeAuthForm && (
            <section className="py-16 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
                {activeAuthForm === 'login' ? (
                  <LoginForm
                    type={loginType}
                    onSwitchToRegister={() => setActiveAuthForm('register')}
                    onClose={() => setActiveAuthForm(null)}
                  />
                ) : (
                  <RegisterForm
                    onSwitchToLogin={() => setActiveAuthForm('login')}
                    onClose={() => setActiveAuthForm(null)}
                  />
                )}
              </div>
            </section>
          )}

          {/* Testimonials */}
          <section id="testimonials" className="py-16 bg-[#e7e5e4]">
            <TestimonialsSection />
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-16 bg-white">
            <ContactSection />
          </section>
        </div>
      </main>
    );
  }

  // Fallback - should not reach here
  return null;
}