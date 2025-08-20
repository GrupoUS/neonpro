-- scripts/01-setup-profiles.sql

-- 1. Cria a tabela para armazenar os perfis públicos dos usuários.
CREATE TABLE public.profiles (
id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
full_name TEXT,
avatar_url TEXT,
updated_at TIMESTAMPTZ
);
-- Comentário: A cláusula ON DELETE CASCADE garante que se um usuário for deletado de auth.users, seu perfil correspondente também será.

-- 2. Habilita a Row Level Security (RLS) para a tabela de perfis.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Comentário: RLS é crucial para garantir que os usuários só possam acessar e modificar seus próprios dados de perfil.

-- 3. Cria as políticas de segurança para a tabela de perfis.
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
FOR SELECT USING (true);
-- Comentário: Permite que qualquer pessoa (autenticada ou não, dependendo das regras de acesso ao banco) visualize perfis.

CREATE POLICY "Users can insert their own profile." ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);
-- Comentário: Permite que um usuário autenticado insira seu próprio perfil. auth.uid() retorna o ID do usuário logado.

CREATE POLICY "Users can update their own profile." ON public.profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Comentário: Permite que um usuário autenticado atualize seu próprio perfil.

-- 4. Cria uma função para ser executada automaticamente quando um novo usuário é criado no Supabase Auth.
-- Esta função insere uma nova linha na tabela `public.profiles` com os metadados do usuário.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
VALUES (
  new.id,
  new.raw_user_meta_data->>'full_name',
  new.raw_user_meta_data->>'avatar_url',
  NOW() -- Define updated_at no momento da criação do perfil
);
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;
-- Comentário: SECURITY DEFINER faz a função rodar com os privilégios do usuário que a criou (geralmente um superusuário).
-- SET search_path = public, pg_catalog é uma medida de segurança e estabilidade.

-- 5. Cria o trigger que aciona a função `handle_new_user` após cada novo registro em `auth.users`.
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- Comentário: Este trigger automatiza a criação do perfil do usuário.

-- 6. Cria uma função para atualizar o campo `updated_at` automaticamente.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Comentário: Função genérica para definir o timestamp de atualização.

-- 7. Cria um trigger para atualizar `updated_at` na tabela `profiles` antes de cada UPDATE.
CREATE TRIGGER handle_profile_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();
-- Comentário: Garante que `updated_at` reflita a última modificação no perfil.
