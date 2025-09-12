import { createFileRoute } from '@tanstack/react-router';
import ParticleButton from '@/components/kokonutui/particle-button';

export const Route = createFileRoute('/particle-test')({
  component: ParticleTestPage,
});

function ParticleTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          🎉 ParticleButton Test
        </h1>
        
        <div className="space-y-4">
          <ParticleButton 
            variant="default" 
            size="lg"
            onSuccess={() => console.log('Particle animation complete!')}
            successDuration={1500}
          >
            Clique para ver as partículas!
          </ParticleButton>
          
          <ParticleButton 
            variant="outline" 
            size="default"
            className="mx-4"
          >
            Botão Outline
          </ParticleButton>
          
          <ParticleButton 
            variant="ghost" 
            size="sm"
          >
            Botão Pequeno
          </ParticleButton>
        </div>
        
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          ✅ Componente KokonutUI instalado com sucesso<br/>
          🚫 CLI shadcn contornado (evita erro npm EUNSUPPORTEDPROTOCOL)
        </p>
      </div>
    </div>
  );
}