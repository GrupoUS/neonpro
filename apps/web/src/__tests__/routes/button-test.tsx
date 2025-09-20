import { createFileRoute } from "@tanstack/react-router";
import { AdvancedButton } from "../components/ui/advanced-button";

export const Route = createFileRoute("/__tests/button-test")({
  component: ButtonTestPage,
});

function ButtonTestPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Button Test (Updated)</h1>
        <p className="text-lg text-muted-foreground">
          Teste usando AdvancedButton que funciona perfeitamente
        </p>
      </div>

      {/* Teste 1: AdvancedButton com hover border */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Teste 1: AdvancedButton com Hover Border
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <AdvancedButton
            variant="default"
            enableHoverBorder={true}
            hoverBorderDuration={2}
            hoverClockwise={true}
          >
            Hover Border (Clockwise)
          </AdvancedButton>

          <AdvancedButton
            variant="secondary"
            enableHoverBorder={true}
            hoverBorderDuration={1}
            hoverClockwise={false}
          >
            Hover Border (Counter)
          </AdvancedButton>

          <AdvancedButton
            variant="gradient-neon"
            enableShineBorder={true}
            shineDuration={3}
            shineColor="#AC9469"
          >
            NeonPro Shine
          </AdvancedButton>
        </div>
      </section>

      {/* Teste 2: Gradient Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Teste 2: Gradient Effects</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <AdvancedButton variant="gradient-primary" effect="hover">
            Gradient Primary
          </AdvancedButton>

          <AdvancedButton variant="gradient-gold" effect="bounce">
            Gradient Gold
          </AdvancedButton>

          <AdvancedButton variant="gradient-neon" effect="hover">
            NeonPro Gradient
          </AdvancedButton>
        </div>
      </section>

      {/* Teste 3: Neumorph Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Teste 3: Neumorph Effects</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <AdvancedButton variant="neumorph" effect="neumorph">
            Neumorph Default
          </AdvancedButton>

          <AdvancedButton variant="neumorph-primary" effect="neumorph">
            Neumorph Primary
          </AdvancedButton>

          <AdvancedButton variant="neumorph-gold" effect="neumorph">
            Neumorph Gold
          </AdvancedButton>
        </div>
      </section>

      {/* Teste 4: Combinações */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Teste 4: Combinações Avançadas
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <AdvancedButton
            variant="gradient-neon"
            enableShineBorder={true}
            enableHoverBorder={true}
            effect="bounce"
            size="lg"
          >
            ALL EFFECTS! 🎉
          </AdvancedButton>

          <AdvancedButton
            variant="neumorph"
            enableHoverBorder={true}
            effect="neumorph"
            size="lg"
          >
            Neumorph + Border
          </AdvancedButton>
        </div>
      </section>
    </div>
  );
}
