import { createFileRoute } from '@tanstack/react-router';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/molecules/card';
import { ShineBorder } from '@/components/ui/shine-border';

export const Route = createFileRoute('/shine-test')({
  component: ShineTestPage,
});

function ShineTestPage() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Shine Border Test Page</h1>
        
        {/* Test 1: Direct ShineBorder Component */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test 1: Direct ShineBorder Component</h2>
          <div className="relative w-64 h-32 bg-card border rounded-xl mx-auto">
            <ShineBorder 
              borderWidth={2}
              duration={8}
              shineColor="#AC9469"
              className="rounded-xl"
            />
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <p className="text-center">Direct ShineBorder</p>
            </div>
          </div>
        </div>

        {/* Test 2: Card with Default Shine */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test 2: Card with Default Shine (disableShine=false)</h2>
          <div className="max-w-md mx-auto">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Default Card with Shine</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card should have the default shine effect enabled.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test 3: Card with Magic Prop */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test 3: Card with Magic Prop</h2>
          <div className="max-w-md mx-auto">
            <Card enableShineBorder className="p-6">
              <CardHeader>
                <CardTitle>Magic Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card has the magic prop enabled.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test 4: Card with Custom Shine Properties */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test 4: Card with Custom Shine Properties</h2>
          <div className="max-w-md mx-auto">
            <Card 
              shineDuration={4}
              shineColor="#FFD700"
              borderWidth={3}
              className="p-6"
            >
              <CardHeader>
                <CardTitle>Custom Shine Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Fast golden shine (4s duration, 3px border)</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test 5: Card with Shine Disabled */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test 5: Card with Shine Disabled</h2>
          <div className="max-w-md mx-auto">
            <Card enableShineBorder={false} className="p-6">
              <CardHeader>
                <CardTitle>No Shine Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card has shine disabled.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test 6: Multiple Colors */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test 6: Multiple Shine Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card shineColor="#AC9469" shineDuration={6} className="p-4">
              <CardContent>
                <p className="text-center">NeonPro Gold</p>
              </CardContent>
            </Card>
            <Card shineColor="#3B82F6" shineDuration={6} className="p-4">
              <CardContent>
                <p className="text-center">Blue Shine</p>
              </CardContent>
            </Card>
            <Card shineColor="#EF4444" shineDuration={6} className="p-4">
              <CardContent>
                <p className="text-center">Red Shine</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Debug Info */}
        <div className="space-y-4 bg-muted p-4 rounded-lg">
          <h2 className="text-xl font-semibold">Debug Information</h2>
          <div className="text-sm space-y-2">
            <p><strong>Expected Behavior:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Golden light should travel around card borders</li>
              <li>Animation should be smooth and continuous</li>
              <li>Effect should be visible as a subtle glow</li>
              <li>Different durations should be noticeable</li>
            </ul>
            <p className="mt-4"><strong>CSS Animation:</strong> shine keyframes with background-position</p>
            <p><strong>Mask Composite:</strong> exclude/xor for border effect</p>
            <p><strong>Background:</strong> conic-gradient with 300% size</p>
          </div>
        </div>
      </div>
    </div>
  );
}
