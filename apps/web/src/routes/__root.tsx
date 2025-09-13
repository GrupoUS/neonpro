import { createRootRoute, Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createRootRoute('/__root-simple')({
  component: () => (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6' 
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>🧪 NEON PRO - TESTE SIMPLES</h1>
        <nav style={{ marginTop: '10px' }}>
          <a href="/" style={{ marginRight: '20px', color: '#007bff' }}>Home</a>
          <a href="/subscription" style={{ marginRight: '20px', color: '#007bff' }}>Subscription</a>
          <a href="/subscription-test" style={{ color: '#007bff' }}>Subscription Test</a>
        </nav>
      </header>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  ),
});
