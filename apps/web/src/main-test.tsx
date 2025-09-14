import ReactDOM from 'react-dom/client';

// Simple test component
function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 TESTE DE FUNCIONAMENTO</h1>
      <p>Se você está vendo esta mensagem, o React está funcionando!</p>
      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '5px',
        }}
      >
        <h2>Status do Sistema:</h2>
        <ul>
          <li>✅ React carregado</li>
          <li>✅ JavaScript funcionando</li>
          <li>✅ DOM renderizado</li>
        </ul>
      </div>
      <button
        onClick={() => alert('Botão funcionando!')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Testar Interação
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<TestApp />);
