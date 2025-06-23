# Configuração do Supabase para NeonPro

## Informações do Projeto

- **Project ID**: gfkskrkbnawkuppazkpt
- **Supabase URL**: https://gfkskrkbnawkuppazkpt.supabase.co
- **Domínio de Produção**: https://neonpro.vercel.app

## 1. Configurações de URLs no Dashboard Supabase

### Passo 1: Acessar o Dashboard

1. Acesse: https://app.supabase.com/project/gfkskrkbnawkuppazkpt
2. Vá para **Authentication** > **URL Configuration**

### Passo 2: Configurar Site URL

Em **Site URL**, configure:

```
https://neonpro.vercel.app
```

### Passo 3: Configurar Redirect URLs

Em **Redirect URLs**, adicione TODAS as seguintes URLs:

```
# Produção
https://neonpro.vercel.app/auth/callback
https://neonpro.vercel.app/auth/popup-callback
https://neonpro.vercel.app/dashboard
https://neonpro.vercel.app/login

# Desenvolvimento Local
http://localhost:3000/auth/callback
http://localhost:3000/auth/popup-callback
http://localhost:3000/dashboard
http://localhost:3000/login

# Preview Deployments (Vercel)
https://neonpro-*.vercel.app/auth/callback
https://neonpro-*.vercel.app/auth/popup-callback
```

### Passo 4: Salvar Configurações

Clique em **Save** após adicionar todas as URLs.

## 2. Configuração do Google OAuth

### Passo 1: Acessar Providers

1. Em **Authentication** > **Providers**
2. Clique em **Google**

### Passo 2: Habilitar Google Provider

1. Toggle **Enable Google** para ON
2. Você verá os campos para Client ID e Client Secret

### Passo 3: Configurar no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione existente
3. Vá para **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth client ID**
5. Escolha **Web application**
6. Configure:
   - **Name**: NeonPro OAuth
   - **Authorized JavaScript origins**:
     ```
     https://neonpro.vercel.app
     http://localhost:3000
     https://gfkskrkbnawkuppazkpt.supabase.co
     ```
   - **Authorized redirect URIs**:
     ```
     https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback
     https://neonpro.vercel.app/auth/callback
     https://neonpro.vercel.app/auth/popup-callback
     http://localhost:3000/auth/callback
     http://localhost:3000/auth/popup-callback
     ```

### Passo 4: Copiar Credenciais

1. Após criar, copie o **Client ID** e **Client Secret**
2. Cole no Supabase Dashboard nos campos correspondentes
3. Clique em **Save**

## 3. Variáveis de Ambiente

### Para Desenvolvimento Local (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gfkskrkbnawkuppazkpt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdma3NrcmtibmF3a3VwcGF6a3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTExMzUsImV4cCI6MjA2MzUyNzEzNX0.hpJNATAkIwxQt_Z2Q-hxcxHX4wXszvc7eV24Sfs30ic

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Para Produção (Vercel Dashboard)

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **neonpro**
3. Vá para **Settings** > **Environment Variables**
4. Adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://gfkskrkbnawkuppazkpt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_SITE_URL=https://neonpro.vercel.app
   ```

## 4. Verificação da Configuração

### Teste Local

```bash
# No diretório do projeto
pnpm dev

# Acesse http://localhost:3000/login
# Teste o login com Google
```

### Checklist de Verificação

- [ ] Site URL configurada corretamente
- [ ] Todas as Redirect URLs adicionadas
- [ ] Google Provider habilitado
- [ ] Client ID e Secret configurados
- [ ] Variáveis de ambiente no Vercel
- [ ] URLs do Google Cloud Console corretas

## 5. Troubleshooting

### Erro: redirect_uri_mismatch

- Verifique se TODAS as URLs estão exatamente iguais no Supabase e Google Console
- Certifique-se de incluir a porta :3000 para localhost
- Inclua tanto http:// quanto https:// conforme apropriado

### Erro: Popup bloqueado

- Certifique-se que o popup é aberto em resposta direta a um clique do usuário
- Não use async/await antes de window.open()

### Erro: No code received

- Verifique se as URLs de callback estão corretas
- Confirme que o Google Provider está habilitado no Supabase

## 6. URLs Importantes

- **Supabase Dashboard**: https://app.supabase.com/project/gfkskrkbnawkuppazkpt
- **Google Cloud Console**: https://console.cloud.google.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Aplicação em Produção**: https://neonpro.vercel.app
