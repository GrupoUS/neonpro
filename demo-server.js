#!/usr/bin/env node

/**
 * NEONPRO Demo Server
 * Servidor simples para demonstração e teste das páginas
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Páginas de demonstração
const pages = {
  '/': createHomePage(),
  '/login': createLoginPage(),
  '/dashboard': createDashboardPage(),
  '/dashboard/patients': createPatientsPage(),
  '/dashboard/appointments': createAppointmentsPage(),
  '/dashboard/treatments': createTreatmentsPage(),
  '/dashboard/payments': createPaymentsPage(),
  '/dashboard/ai-recommendations': createAIRecommendationsPage()
};

function createHomePage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEONPRO - Advanced Business SaaS Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: { DEFAULT: '#112031', medium: '#294359' },
                        accent: { DEFAULT: '#AC9469' },
                        neutral: { warm: '#B4AC9C', light: '#D2D0C8' },
                        background: '#FFFFFF',
                        surface: '#F8F9FA',
                        foreground: '#112031',
                        muted: { DEFAULT: '#B4AC9C', foreground: '#B4AC9C' },
                        border: '#D2D0C8'
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                        display: ['Optima', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif']
                    },
                    backgroundImage: {
                        'gradient-primary': 'linear-gradient(135deg, #112031 0%, #294359 100%)'
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="min-h-screen bg-background">
    <div class="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div class="text-center text-white">
            <h1 class="text-6xl font-bold font-display mb-6">NEONPRO</h1>
            <p class="text-xl mb-8 text-white/90">Advanced Business SaaS Platform</p>
            <div class="space-x-4">
                <a href="/login" class="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors">
                    Fazer Login
                </a>
                <a href="/dashboard" class="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                    Ver Dashboard
                </a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function createLoginPage() {
  return fs.readFileSync(path.join(__dirname, 'static-demo', 'neonpro-demo.html'), 'utf8')
    .replace('Advanced Business SaaS Platform', 'Login - Advanced Business SaaS Platform')
    .replace('Demo: All components successfully implemented', 'Servidor de desenvolvimento ativo! Teste o login real.');
}

function createDashboardPage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - NEONPRO</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: { DEFAULT: '#112031', medium: '#294359' },
                        accent: { DEFAULT: '#AC9469' },
                        neutral: { warm: '#B4AC9C', light: '#D2D0C8' },
                        background: '#FFFFFF',
                        surface: '#F8F9FA',
                        foreground: '#112031',
                        muted: { DEFAULT: '#B4AC9C', foreground: '#B4AC9C' },
                        border: '#D2D0C8',
                        success: '#10B981'
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                        display: ['Optima', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif']
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="min-h-screen bg-background">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div class="w-64 bg-surface border-r border-border">
            <div class="p-6">
                <h1 class="text-2xl font-bold font-display text-primary">NEONPRO</h1>
            </div>
            <nav class="mt-6">
                <a href="/dashboard" class="block px-6 py-3 text-primary bg-primary/10 border-r-2 border-primary">Dashboard</a>
                <a href="/dashboard/patients" class="block px-6 py-3 text-muted hover:text-primary hover:bg-surface">Pacientes</a>
                <a href="/dashboard/appointments" class="block px-6 py-3 text-muted hover:text-primary hover:bg-surface">Consultas</a>
                <a href="/dashboard/treatments" class="block px-6 py-3 text-muted hover:text-primary hover:bg-surface">Tratamentos</a>
                <a href="/dashboard/payments" class="block px-6 py-3 text-muted hover:text-primary hover:bg-surface">Pagamentos</a>
                <a href="/dashboard/ai-recommendations" class="block px-6 py-3 text-muted hover:text-primary hover:bg-surface">IA Recomendações</a>
            </nav>
        </div>
        
        <!-- Main Content -->
        <div class="flex-1 p-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold font-display text-foreground">Dashboard Principal</h2>
                <p class="text-muted-foreground mt-2">Visão geral da sua clínica</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg border border-border shadow-sm">
                    <h3 class="text-sm font-medium text-muted-foreground">Total Pacientes</h3>
                    <p class="text-3xl font-bold text-foreground mt-2">1,234</p>
                    <p class="text-sm text-success mt-1">+12% este mês</p>
                </div>
                <div class="bg-white p-6 rounded-lg border border-border shadow-sm">
                    <h3 class="text-sm font-medium text-muted-foreground">Consultas Hoje</h3>
                    <p class="text-3xl font-bold text-foreground mt-2">28</p>
                    <p class="text-sm text-success mt-1">+5% esta semana</p>
                </div>
                <div class="bg-white p-6 rounded-lg border border-border shadow-sm">
                    <h3 class="text-sm font-medium text-muted-foreground">Receita Mensal</h3>
                    <p class="text-3xl font-bold text-foreground mt-2">R$ 45,2K</p>
                    <p class="text-sm text-success mt-1">+8% este mês</p>
                </div>
                <div class="bg-white p-6 rounded-lg border border-border shadow-sm">
                    <h3 class="text-sm font-medium text-muted-foreground">Satisfação</h3>
                    <p class="text-3xl font-bold text-foreground mt-2">98%</p>
                    <p class="text-sm text-success mt-1">+2% este mês</p>
                </div>
            </div>
            
            <div class="bg-success/10 border border-success/20 rounded-lg p-4">
                <p class="text-success font-medium">✅ Servidor de desenvolvimento ativo!</p>
                <p class="text-success/80 text-sm mt-1">Todas as páginas estão funcionais para teste.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function createPatientsPage() {
  return createPageTemplate('Pacientes', 'Gerenciamento de pacientes da clínica', [
    { name: 'João Silva', age: '45 anos', lastVisit: '15/06/2025' },
    { name: 'Maria Santos', age: '32 anos', lastVisit: '14/06/2025' },
    { name: 'Pedro Costa', age: '28 anos', lastVisit: '13/06/2025' }
  ]);
}

function createAppointmentsPage() {
  return createPageTemplate('Consultas', 'Agendamentos e consultas', [
    { time: '09:00', patient: 'Ana Lima', type: 'Consulta' },
    { time: '10:30', patient: 'Carlos Souza', type: 'Retorno' },
    { time: '14:00', patient: 'Lucia Ferreira', type: 'Avaliação' }
  ]);
}

function createTreatmentsPage() {
  return createPageTemplate('Tratamentos', 'Planos de tratamento ativos', [
    { patient: 'João Silva', treatment: 'Ortodontia', progress: '60%' },
    { patient: 'Maria Santos', treatment: 'Implante', progress: '30%' },
    { patient: 'Pedro Costa', treatment: 'Limpeza', progress: '100%' }
  ]);
}

function createPaymentsPage() {
  return createPageTemplate('Pagamentos', 'Controle financeiro e pagamentos', [
    { patient: 'João Silva', amount: 'R$ 450,00', status: 'Pago' },
    { patient: 'Maria Santos', amount: 'R$ 1.200,00', status: 'Pendente' },
    { patient: 'Pedro Costa', amount: 'R$ 180,00', status: 'Pago' }
  ]);
}

function createAIRecommendationsPage() {
  return createPageTemplate('IA Recomendações', 'Recomendações inteligentes baseadas em IA', [
    { type: 'Agendamento', recommendation: 'Agendar retorno para João Silva em 2 semanas' },
    { type: 'Tratamento', recommendation: 'Considerar implante para Maria Santos' },
    { type: 'Financeiro', recommendation: 'Oferecer desconto para Pedro Costa' }
  ]);
}

function createPageTemplate(title, description, items) {
  const itemsHtml = items.map(item => {
    const keys = Object.keys(item);
    return `<div class="bg-white p-4 rounded-lg border border-border">
      ${keys.map(key => `<p class="text-sm"><span class="font-medium">${key}:</span> ${item[key]}</p>`).join('')}
    </div>`;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - NEONPRO</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: { DEFAULT: '#112031', medium: '#294359' },
                        accent: { DEFAULT: '#AC9469' },
                        neutral: { warm: '#B4AC9C', light: '#D2D0C8' },
                        background: '#FFFFFF',
                        surface: '#F8F9FA',
                        foreground: '#112031',
                        muted: { DEFAULT: '#B4AC9C', foreground: '#B4AC9C' },
                        border: '#D2D0C8',
                        success: '#10B981'
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                        display: ['Optima', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif']
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="min-h-screen bg-background">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div class="w-64 bg-surface border-r border-border">
            <div class="p-6">
                <h1 class="text-2xl font-bold font-display text-primary">NEONPRO</h1>
            </div>
            <nav class="mt-6">
                <a href="/dashboard" class="block px-6 py-3 text-muted hover:text-primary hover:bg-surface">Dashboard</a>
                <a href="/dashboard/patients" class="block px-6 py-3 ${title === 'Pacientes' ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-muted hover:text-primary hover:bg-surface'}">Pacientes</a>
                <a href="/dashboard/appointments" class="block px-6 py-3 ${title === 'Consultas' ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-muted hover:text-primary hover:bg-surface'}">Consultas</a>
                <a href="/dashboard/treatments" class="block px-6 py-3 ${title === 'Tratamentos' ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-muted hover:text-primary hover:bg-surface'}">Tratamentos</a>
                <a href="/dashboard/payments" class="block px-6 py-3 ${title === 'Pagamentos' ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-muted hover:text-primary hover:bg-surface'}">Pagamentos</a>
                <a href="/dashboard/ai-recommendations" class="block px-6 py-3 ${title === 'IA Recomendações' ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-muted hover:text-primary hover:bg-surface'}">IA Recomendações</a>
            </nav>
        </div>
        
        <!-- Main Content -->
        <div class="flex-1 p-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold font-display text-foreground">${title}</h2>
                <p class="text-muted-foreground mt-2">${description}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${itemsHtml}
            </div>
            
            <div class="mt-8 bg-success/10 border border-success/20 rounded-lg p-4">
                <p class="text-success font-medium">✅ Página ${title} carregada com sucesso!</p>
                <p class="text-success/80 text-sm mt-1">Navegue pelas outras páginas usando o menu lateral.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// Criar servidor HTTP
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Servir páginas
  if (pages[pathname]) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(pages[pathname]);
    return;
  }

  // Servir arquivos estáticos
  if (pathname.startsWith('/static/')) {
    const filePath = path.join(__dirname, pathname);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 - Página não encontrada</h1><p><a href="/">Voltar ao início</a></p>');
});

server.listen(PORT, () => {
  console.log('🚀 NEONPRO Demo Server iniciado!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔐 Login: http://localhost:${PORT}/login`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log('\n✨ Páginas disponíveis:');
  console.log('   • / (Home)');
  console.log('   • /login (Autenticação)');
  console.log('   • /dashboard (Dashboard Principal)');
  console.log('   • /dashboard/patients (Pacientes)');
  console.log('   • /dashboard/appointments (Consultas)');
  console.log('   • /dashboard/treatments (Tratamentos)');
  console.log('   • /dashboard/payments (Pagamentos)');
  console.log('   • /dashboard/ai-recommendations (IA Recomendações)');
  console.log('\n🎯 Pronto para teste completo!');
});
