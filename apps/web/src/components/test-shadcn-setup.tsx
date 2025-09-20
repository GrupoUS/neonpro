import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui';
import { cn } from '@neonpro/ui';
import { useState } from 'react';

export function TestShadcnSetup() {
  const [loading, setLoading] = useState(false);

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className='p-8 space-y-8'>
      <div className='bg-gradient-to-r from-[#AC9469]/10 to-[#112031]/10 border border-[#AC9469]/30 text-[#112031] px-6 py-4 rounded-lg mb-6'>
        <h2 className='text-2xl font-bold mb-2'>
          🎨 NeonPro Neumorph Button - Brand Colors Applied
        </h2>
        <div className='grid md:grid-cols-2 gap-4 text-sm'>
          <div>
            <p>
              <strong>✅ Expected Result:</strong> Neumorphic 3D styling with NeonPro brand colors
            </p>
            <p>
              <strong>🎨 Primary Gold:</strong> #AC9469 (Pantone 4007C)
            </p>
            <p>
              <strong>🔵 Deep Blue:</strong> #112031 (NeonPro Navy)
            </p>
          </div>
          <div>
            <p>
              <strong>📐 Border Radius:</strong> Reduced for refined appearance
            </p>
            <p>
              <strong>🎭 Animations:</strong> Gradient, border spin, and shimmer effects
            </p>
            <p>
              <strong>♿ Accessibility:</strong> Respects prefers-reduced-motion
            </p>
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>
          Backward Compatible Button (shadcn API)
        </h3>
        <p className='text-sm text-gray-600'>
          These use the old shadcn Button API but render as Neumorph Buttons:
        </p>
        <div className='flex gap-2 flex-wrap'>
          <Button>Default Button</Button>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='ghost'>Ghost</Button>
          <Button variant='destructive'>Destructive</Button>
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>
          New Neumorph Button (cult-ui API)
        </h3>
        <p className='text-sm text-gray-600'>
          These use the new Neumorph Button API with enhanced styling:
        </p>
        <div className='space-y-3'>
          <div>
            <p className='text-sm font-medium mb-2'>Button Variants:</p>
            <div className='flex gap-2 flex-wrap'>
              <Button>Default</Button>
              <Button variant='default'>Primary</Button>
              <Button variant='secondary'>Secondary</Button>
              <Button variant='destructive'>Danger</Button>
            </div>
          </div>

          <div>
            <p className='text-sm font-medium mb-2'>Button Sizes:</p>
            <div className='flex gap-2 items-center flex-wrap'>
              <Button size='sm'>Small</Button>
              <Button size='default'>Medium</Button>
              <Button size='lg'>Large</Button>
            </div>
          </div>

          <div>
            <p className='text-sm font-medium mb-2'>Loading State:</p>
            <div className='flex gap-2 flex-wrap'>
              <Button onClick={handleLoadingTest}>
                {loading ? 'Loading...' : 'Click to Load'}
              </Button>
            </div>
          </div>

          <div>
            <p className='text-sm font-medium mb-2'>Disabled States:</p>
            <div className='flex gap-2 flex-wrap'>
              <Button disabled>Disabled Default</Button>
              <Button variant='default' disabled>
                Disabled Primary
              </Button>
            </div>
          </div>

          <div>
            <p className='text-sm font-medium mb-2'>Full Width:</p>
            <Button className='w-full'>Full Width Button</Button>
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Size Comparison (shadcn API)</h3>
        <p className='text-sm text-gray-600'>
          Testing backward compatibility with old size names:
        </p>
        <div className='flex gap-2 items-center'>
          <Button size='sm'>Small</Button>
          <Button size='default'>Default</Button>
          <Button size='lg'>Large</Button>
        </div>
      </div>

      <div className='space-y-2'>
        <p>Testing Card components:</p>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>
              This is a card description from @neonpro/ui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This card content demonstrates the shadcn/ui Card component working in our monorepo
              setup.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='space-y-2'>
        <p>Testing cn utility function:</p>
        <div
          className={cn(
            'p-4 rounded-lg border',
            'bg-green-50 border-green-200 text-green-800',
          )}
        >
          This div uses the cn() utility function from @neonpro/ui/lib/utils
        </div>
      </div>
    </div>
  );
}
