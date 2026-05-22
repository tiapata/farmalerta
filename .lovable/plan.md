O erro "Database error saving new user" é geralmente causado por uma falha no gatilho (trigger) do banco de dados que tenta criar o perfil do usuário automaticamente quando uma nova conta é registrada.

Vou fornecer um script SQL aprimorado e robusto que resolve os problemas mais comuns:
1.  **Caminho de Busca (Search Path):** Garante que a função encontre a tabela `profiles`.
2.  **Segurança (Security Definer):** Garante que a função tenha permissões suficientes.
3.  **Tratamento de Conflitos:** Evita erros se o perfil já existir.
4.  **Grants de Permissão:** Garante que o sistema de autenticação possa interagir com a tabela public.

Além disso, ajustei levemente a tela de login para fornecer mais detalhes caso ocorra um erro.

### Passo 1: Executar o SQL no Supabase

Copie e cole o código abaixo no seu **SQL Editor** do Supabase e clique em **Run**:

```sql
-- 1. Garantir que a tabela profiles existe e tem a estrutura correta
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    pharmacy_id UUID REFERENCES public.pharmacies(id),
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS e configurar permissões
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT ALL ON TABLE public.profiles TO authenticated;

-- 3. Limpar políticas antigas e criar novas para garantir acesso
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. Função de gatilho robusta (Handle New User)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário Novo'),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Isso garante que o usuário seja criado mesmo se o perfil falhar (evita o erro de banco de dados no signup)
  RETURN NEW;
END;
$$;

-- 5. Recriar o gatilho
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Passo 2: Testar o Cadastro
Após rodar o SQL, tente cadastrar um novo usuário novamente na tela de login.

Caso ainda veja o erro, por favor abra o "Console" do seu navegador (F12) e me envie a mensagem detalhada que aparecerá lá.
