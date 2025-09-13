import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>🎉 NEON PRO FUNCIONANDO!</h1>
        <p style={{ color: '#666', fontSize: '18px' }}>
          Sistema para Clínicas de Estética - Ambiente de Desenvolvimento
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
          }}
        >
          <h2 style={{ color: '#28a745', marginBottom: '15px' }}>✅ Status do Sistema</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '8px' }}>✅ React carregado e funcionando</li>
            <li style={{ marginBottom: '8px' }}>✅ TanStack Router ativo</li>
            <li style={{ marginBottom: '8px' }}>✅ Vite dev server rodando</li>
            <li style={{ marginBottom: '8px' }}>✅ Roteamento funcionando</li>
          </ul>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
            border: '1px solid #b3d9ff',
          }}
        >
          <h2 style={{ color: '#007bff', marginBottom: '15px' }}>🔗 Navegação</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href='/subscription-test'
              style={{
                padding: '10px 15px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                textAlign: 'center',
              }}
            >
              📋 Teste Subscription
            </a>
            <a
              href='/subscription'
              style={{
                padding: '10px 15px',
                backgroundColor: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                textAlign: 'center',
              }}
            >
              💳 Subscription Original
            </a>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffeaa7',
        }}
      >
        <h2 style={{ color: '#856404', marginBottom: '15px' }}>🔧 Informações de Debug</h2>
        <div style={{ fontSize: '14px', color: '#856404' }}>
          <p>
            <strong>Porta:</strong> http://localhost:8080
          </p>
          <p>
            <strong>Ambiente:</strong> Desenvolvimento
          </p>
          <p>
            <strong>Status:</strong> Funcionando corretamente
          </p>
          <p>
            <strong>Última atualização:</strong> {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
