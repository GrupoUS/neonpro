import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('🚀 main-minimal.tsx carregado!');

function MinimalApp() {
  console.log('🎯 MinimalApp renderizado!');
  
  return React.createElement('div', {
    style: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh'
    }
  }, [
    React.createElement('h1', { key: 'title', style: { color: '#333' } }, '🎉 REACT MÍNIMO FUNCIONANDO!'),
    React.createElement('p', { key: 'desc', style: { color: '#666' } }, 'Se você está vendo esta mensagem, o React está funcionando sem JSX!'),
    React.createElement('div', {
      key: 'status',
      style: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '5px'
      }
    }, [
      React.createElement('h2', { key: 'status-title' }, '✅ Status'),
      React.createElement('ul', { key: 'status-list' }, [
        React.createElement('li', { key: 'react' }, '✅ React carregado'),
        React.createElement('li', { key: 'dom' }, '✅ ReactDOM funcionando'),
        React.createElement('li', { key: 'render' }, '✅ Renderização ativa'),
        React.createElement('li', { key: 'js' }, '✅ JavaScript executando')
      ])
    ]),
    React.createElement('button', {
      key: 'button',
      onClick: () => alert('Botão React funcionando!'),
      style: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }
    }, 'Testar Interação React')
  ]);
}

console.log('🎯 Tentando renderizar MinimalApp...');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  console.log('✅ Root encontrado, criando React root...');
  const root = ReactDOM.createRoot(rootElement);
  console.log('Root criado:', root);
  
  try {
    root.render(React.createElement(MinimalApp));
    console.log('✅ MinimalApp renderizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao renderizar MinimalApp:', error);
  }
} else {
  console.error('❌ Elemento root não encontrado!');
}
