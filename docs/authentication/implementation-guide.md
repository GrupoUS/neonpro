# Guia de Implementação - Autenticação Supabase

## Visão Geral

Este guia detalha a implementação de autenticação usando Supabase CLI conectado ao servidor Brasil, substituindo qualquer implementação anterior com Docker ou Better Auth.

## Configuração do Supabase

### 1. Instalação do Supabase CLI

```bash
npm install -g supabase
```

### 2. Configuração do Projeto

```bash
# Inicializar projeto Supabase
supabase init

# Login no Supabase (servidor Brasil)
supabase login

# Link com projeto existente no servidor Brasil
supabase link --project-ref <project-ref>
```

### 3. Estrutura de Autenticação

#### 3.1 Configuração de Políticas RLS

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus dados
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

#### 3.2 Schema de Usuários

```sql
-- Tabela de perfis de usuário
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (id)
);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Implementação Backend

### 1. Configuração do Cliente Supabase

```javascript
// config/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 2. Middleware de Autenticação

```javascript
// middleware/auth.js
import { supabase } from '../config/supabase.js'

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Erro na autenticação' })
  }
}
```

### 3. Rotas de Autenticação

```javascript
// routes/auth.js
import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      message: 'Usuário criado com sucesso',
      user: data.user,
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      message: 'Login realizado com sucesso',
      user: data.user,
      session: data.session,
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ message: 'Logout realizado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
```

## Implementação Frontend

### 1. Configuração do Cliente

```javascript
// utils/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. Context de Autenticação

```javascript
// contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Ouvir mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

## Variáveis de Ambiente

### Backend (.env)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Frontend (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Comandos Supabase CLI

```bash
# Iniciar desenvolvimento local
supabase start

# Aplicar migrations
supabase db push

# Gerar tipos TypeScript
supabase gen types typescript --local > types/supabase.ts

# Deploy das functions
supabase functions deploy

# Verificar status
supabase status
```

## Segurança

### 1. Políticas RLS

- Sempre habilitar RLS nas tabelas sensíveis
- Criar políticas específicas para cada operação
- Testar políticas com diferentes usuários

### 2. Validação

- Validar dados no backend
- Sanitizar inputs
- Usar rate limiting

### 3. Tokens

- Configurar expiração adequada
- Implementar refresh tokens
- Validar tokens em todas as rotas protegidas
