"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, FileText, Heart, Shield, Star, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleSignupClick = () => {
    router.push("/signup");
  };

  return (
    <section className="relative">
      {/* Navigation */}
      <nav className="container mx-auto flex items-center justify-between border-border/50 border-b p-6">
        <div className="flex items-center space-x-3">
          <div className="neonpro-gradient neonpro-glow flex h-10 w-10 items-center justify-center rounded-lg">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-bold text-2xl text-primary">
            NeonPro Healthcare
          </h1>
        </div>
        <Button className="neonpro-button-primary" onClick={handleLoginClick}>
          Acessar Sistema
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 font-bold text-5xl text-foreground leading-tight lg:text-6xl">
            Revolução Digital para
            <span className="neonpro-glow mt-2 block text-primary">
              Clínicas Estéticas Brasileiras
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-3xl text-muted-foreground text-xl leading-relaxed">
            Gestão inteligente com compliance total LGPD, ANVISA e CFM. Transforme sua clínica com
            tecnologia de ponta, resultados reais e a confiança do mercado brasileiro de medicina
            estética.
          </p>

          {/* Trust Indicators */}
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <div className="compliance-badge">
              <Shield className="mr-2 h-4 w-4" />
              LGPD Compliant
            </div>
            <div className="compliance-badge">
              <Stethoscope className="mr-2 h-4 w-4" />
              ANVISA Aprovado
            </div>
            <div className="compliance-badge">
              <FileText className="mr-2 h-4 w-4" />
              CFM Certificado
            </div>
            <div className="compliance-badge">
              <Star className="mr-2 h-4 w-4" />
              ISO 27001
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Button
              className="neonpro-button-primary px-8 py-4 text-lg"
              onClick={handleSignupClick}
              size="lg"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              className="border-primary/20 px-8 py-4 text-foreground text-lg hover:bg-primary/5"
              size="lg"
              variant="outline"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Demonstração
            </Button>
          </div>

          {/* Trust Line */}
          <p className="mt-8 text-muted-foreground text-sm">
            ✓ Teste grátis por 30 dias • ✓ Sem cartão de crédito • ✓ Suporte especializado em saúde
          </p>
        </div>
      </div>
    </section>
  );
}
