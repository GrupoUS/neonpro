import { AdvancedButton } from "@/components/ui/advanced-button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__tests/universal-button-test")({
  component: AdvancedButtonTest,
});

function AdvancedButtonTest() {
  return (
    <div className="min-h-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-slate-800 dark:text-slate-200">
          Universal Button Test (NeonPro Colors)
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-12">
          Test all button styles: KokonutUI Gradient, CultUI Neumorph,
          Aceternity Border Gradient, and MagicUI Shine
        </p>

        {/* Basic Test Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Standard Variants */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
              Standard Variants (NeonPro Colors)
            </h3>
            <div className="space-y-4">
              <AdvancedButton variant="default" className="w-full">
                Default (Deep Green)
              </AdvancedButton>
              <AdvancedButton variant="secondary" size="sm" className="w-full">
                Secondary Small (Beige)
              </AdvancedButton>
              <AdvancedButton variant="outline" size="lg" className="w-full">
                Outline Large (Gold Border)
              </AdvancedButton>
            </div>
          </div>

          {/* Effects Testing */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
              Effects Testing
            </h3>
            <div className="space-y-4">
              <AdvancedButton
                enableHoverBorder
                variant="outline"
                className="w-full"
                hoverBorderDuration={2}
              >
                Hover Border Effect
              </AdvancedButton>
              <AdvancedButton
                enableShineBorder
                variant="default"
                className="w-full"
                shineDuration={3}
              >
                Shine Border Effect
              </AdvancedButton>
              <AdvancedButton
                enableHoverBorder
                enableShineBorder
                variant="secondary"
                className="w-full"
                shineDuration={4}
                hoverBorderDuration={2}
              >
                Combined Effects
              </AdvancedButton>
            </div>
          </div>
        </div>

        {/* Gradient Effects Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200">
            Gradient Effects (NeonPro Palette)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdvancedButton variant="gradient-primary" className="h-14">
              Primary Gradient
            </AdvancedButton>

            <AdvancedButton variant="gradient-secondary" className="h-14">
              Secondary Gradient
            </AdvancedButton>

            <AdvancedButton variant="gradient-gold" className="h-14">
              Gold Gradient
            </AdvancedButton>

            <AdvancedButton variant="gradient-neon" className="h-14">
              NeonPro Gradient
            </AdvancedButton>
          </div>
        </div>

        {/* Neumorph Effects Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200">
            Neumorph Effects (Smaller Radius)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdvancedButton
              variant="neumorph"
              className="h-14"
              neumorphIntensity="light"
            >
              Neumorph Light
            </AdvancedButton>

            <AdvancedButton
              variant="neumorph-primary"
              className="h-14"
              neumorphIntensity="medium"
            >
              Neumorph Primary
            </AdvancedButton>

            <AdvancedButton
              variant="neumorph-gold"
              className="h-14"
              neumorphIntensity="strong"
            >
              Neumorph Gold
            </AdvancedButton>
          </div>
        </div>

        {/* Custom Effects */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200">
            Custom Effects (Fixed Animations)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdvancedButton
              variant="default"
              gradientFrom="#AC9469"
              gradientTo="#294359"
              enableHoverBorder
              className="h-14"
              hoverBorderDuration={2}
            >
              Custom Gradient + Hover Border
            </AdvancedButton>

            <AdvancedButton
              enableShineBorder
              shineColor="#AC9469"
              variant="outline"
              className="h-14"
              shineDuration={2}
            >
              Custom Gold Shine
            </AdvancedButton>
          </div>
        </div>

        {/* Combined Advanced Effects */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200">
            Ultimate Combinations
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdvancedButton
              enableHoverBorder
              enableShineBorder
              variant="gradient-neon"
              className="h-16 text-lg"
              hoverBorderDuration={3}
              shineDuration={4}
              shineColor="#AC9469"
            >
              All Effects Combined
            </AdvancedButton>

            <AdvancedButton
              variant="neumorph-gold"
              enableShineBorder
              className="h-16 text-lg"
              shineDuration={3}
              shineColor="#294359"
              neumorphIntensity="medium"
            >
              Neumorph + Shine
            </AdvancedButton>
          </div>
        </div>

        {/* Loading States */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200">
            Loading States
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AdvancedButton loading={true} variant="default" className="h-12">
                Loading Default
              </AdvancedButton>

              <AdvancedButton
                loading={true}
                loadingText="Processing..."
                variant="gradient-gold"
                className="h-12"
              >
                Custom Loading Text
              </AdvancedButton>

              <AdvancedButton
                enableHoverBorder
                loading={true}
                variant="outline"
                className="h-12"
              >
                Loading with Border
              </AdvancedButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
