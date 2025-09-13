import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  console.log('🚀 HomePage component is rendering!');

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', fontSize: '32px', textAlign: 'center' }}>
        🎉 NEON PRO FUNCIONANDO!
      </h1>
      <p style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>
        React está carregando e renderizando componentes!
      </p>
      <div
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          margin: '20px 0',
        }}
      >
        ✅ Aplicação React funcionando perfeitamente!
      </div>
    </div>
  );
}
