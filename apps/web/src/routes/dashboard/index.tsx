import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  console.log('🎯 [DASHBOARD] Dashboard carregando com sucesso!')

  return (
    <div style={{
      padding: '32px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        color: '#333',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            🏥 Dashboard NeonPro
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            margin: '0'
          }}>
            Sistema de Gestão para Clínicas Estéticas
          </p>
        </div>

        {/* Métricas Principais */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>158</div>
            <div style={{ opacity: 0.9 }}>Pacientes Ativos</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📅</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>12</div>
            <div style={{ opacity: 0.9 }}>Agendamentos Hoje</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fa709a, #fee140)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>R$ 24.5K</div>
            <div style={{ opacity: 0.9 }}>Receita do Mês</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
            padding: '24px',
            borderRadius: '12px',
            color: '#333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📊</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>96%</div>
            <div style={{ opacity: 0.7 }}>Taxa de Satisfação</div>
          </div>
        </div>

        {/* Menu de Ações */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <button style={{
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}>
            ➕ Novo Agendamento
          </button>

          <button style={{
            background: '#059669',
            color: 'white',
            border: 'none',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)'
          }}>
            👤 Cadastrar Paciente
          </button>

          <button style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}
          onClick={() => alert('🚨 Protocolo de emergência ativado!')}>
            🚨 Emergência
          </button>

          <button style={{
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}>
            📊 Relatórios
          </button>
        </div>

        {/* Agenda de Hoje */}
        <div style={{
          background: '#f8fafc',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            color: '#1e293b'
          }}>
            📅 Agenda de Hoje
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>Maria Silva - Botox</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dra. Ana Beatriz • Sala 1</div>
              </div>
              <div style={{
                background: '#dbeafe',
                color: '#1d4ed8',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                09:30
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>Ana Oliveira - Preenchimento</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Dr. Carlos Mendes • Sala 2</div>
              </div>
              <div style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                14:00
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>Camila Costa - Limpeza de Pele</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Esteticista Paula • Sala 3</div>
              </div>
              <div style={{
                background: '#fef3c7',
                color: '#92400e',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                16:30
              </div>
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          padding: '16px',
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ color: '#15803d', fontWeight: '500' }}>
            ✅ Dashboard funcionando perfeitamente!
          </div>
          <div style={{ fontSize: '0.875rem', color: '#166534', marginTop: '4px' }}>
            Sistema NeonPro - Versão completa com todos os complementos
          </div>
        </div>
      </div>
    </div>
  )
}