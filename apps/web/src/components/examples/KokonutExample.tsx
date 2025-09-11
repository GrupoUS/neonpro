'use client';

import GradientButton from '@/components/ui/gradient-button';
import ParticleButton from '@/components/ui/particle-button';
import React from 'react';

export default function KokonutExample() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-8 p-8'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold mb-4'>Kokonut UI Components</h1>
        <p className='text-lg text-muted-foreground mb-8'>
          Exemplos de componentes do Kokonut UI funcionando no NeonPro
        </p>
      </div>

      <div className='flex flex-col gap-6 items-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold mb-4'>Particle Button</h2>
          <ParticleButton
            onSuccess={() => console.log('Particle button clicked!')}
            className='bg-blue-600 hover:bg-blue-700'
          >
            Click for Particles! ✨
          </ParticleButton>
        </div>

        <div className='text-center'>
          <h2 className='text-2xl font-semibold mb-4'>Gradient Button</h2>
          <GradientButton
            onClick={() => console.log('Gradient button clicked!')}
            className='px-8 py-3'
          >
            Gradient Magic 🌈
          </GradientButton>
        </div>
      </div>

      <div className='mt-8 p-6 bg-muted rounded-lg max-w-2xl'>
        <h3 className='text-xl font-semibold mb-3'>✅ Kokonut UI Configurado!</h3>
        <ul className='space-y-2 text-sm'>
          <li>• Registry @kokonutui configurado</li>
          <li>• Utils instalado (sem sobrescrever existente)</li>
          <li>• Componentes particle-button e gradient-button instalados</li>
          <li>• Compatível com Aceternity UI</li>
          <li>• Pronto para usar mais componentes!</li>
        </ul>
      </div>
    </div>
  );
}
