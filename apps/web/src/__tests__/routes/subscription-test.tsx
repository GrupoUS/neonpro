import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__tests/subscription-test')({
  component: SubscriptionTestPage,
});

function SubscriptionTestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 TESTE SUBSCRIPTION PAGE</h1>
      <p>Se você está vendo esta mensagem, a rota subscription está funcionando!</p>

      <div
        style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}
      >
        <h2>📋 Status da Subscription</h2>
        <div style={{ marginTop: '10px' }}>
          <p>
            <strong>Status:</strong> Free (Teste)
          </p>
          <p>
            <strong>Modelos Disponíveis:</strong>
          </p>
          <ul>
            <li>✅ ChatGPT-4o-mini</li>
            <li>✅ Gemini Flash 2.5</li>
            <li>🔒 Claude Sonnet (Pro)</li>
            <li>🔒 GPT-4 (Pro)</li>
          </ul>
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
          border: '1px solid #b3d9ff',
        }}
      >
        <h2>🚀 Upgrade para Pro</h2>
        <p>Desbloqueie todos os modelos de IA avançados por apenas R$ 99,00/mês</p>
        <button
          onClick={() => window.open('https://buy.stripe.com/6oU3cw8Tz0IZ4mW2bFgYU02', '_blank')}
          style={{
            marginTop: '10px',
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Upgrade para Pro →
        </button>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffeaa7',
        }}
      >
        <h3>🔧 Informações de Debug</h3>
        <ul>
          <li>✅ React Router funcionando</li>
          <li>✅ Rota /subscription-test carregada</li>
          <li>✅ Componente renderizado</li>
          <li>✅ JavaScript executando</li>
        </ul>
      </div>
    </div>
  );
}
