/**
 * Example usage of the new gradient button components
 * This demonstrates both KokonutGradientButton and AceternityHoverBorderGradientButton
 */

import React from 'react';
import { KokonutGradientButton, AceternityHoverBorderGradientButton } from '@neonpro/ui';

export function GradientButtonsDemo() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">NeonPro Gradient Buttons Demo</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">KokonutGradientButton Variants</h2>
        <div className="flex flex-wrap gap-4">
          <KokonutGradientButton variant="default" size="default">
            Default Gradient
          </KokonutGradientButton>
          
          <KokonutGradientButton variant="colorful" size="lg">
            Colorful Gradient
          </KokonutGradientButton>
          
          <KokonutGradientButton variant="sunset" size="sm">
            Sunset Gradient
          </KokonutGradientButton>
          
          <KokonutGradientButton variant="ocean" size="xl">
            Ocean Gradient
          </KokonutGradientButton>
          
          <KokonutGradientButton variant="neon" size="default">
            Neon Gradient
          </KokonutGradientButton>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">AceternityHoverBorderGradientButton</h2>
        <div className="flex flex-wrap gap-4">
          <AceternityHoverBorderGradientButton 
            duration={1} 
            clockwise={true}
            className="px-6 py-3"
          >
            Hover Me (Clockwise)
          </AceternityHoverBorderGradientButton>
          
          <AceternityHoverBorderGradientButton 
            duration={2} 
            clockwise={false}
            className="px-8 py-4"
          >
            Hover Me (Counter-clockwise)
          </AceternityHoverBorderGradientButton>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Usage Examples</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
{`// KokonutGradientButton
<KokonutGradientButton variant="neon" size="lg">
  Click me!
</KokonutGradientButton>

// AceternityHoverBorderGradientButton
<AceternityHoverBorderGradientButton 
  duration={2} 
  clockwise={false}
>
  Hover for animation!
</AceternityHoverBorderGradientButton>`}
          </pre>
        </div>
      </section>
    </div>
  );
}