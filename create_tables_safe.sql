-- SQL seguro para criar tabelas essenciais sem erros de dependência
-- Executar passo a passo para evitar problemas

-- 1. Primeiro, remover triggers que podem causar conflitos
DROP TRIGGER IF EXISTS update_fornecedores_updated_at ON fornecedores;
DROP TRIGGER IF EXISTS update_empresas_updated_at ON empresas;
DROP TRIGGER IF EXISTS update_contas_pagar_updated_at ON contas_pagar;
DROP TRIGGER IF EXISTS update_contas_pagar_parcelas_updated_at ON contas_pagar_parcelas;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_verifications_updated_at ON verifications;
DROP TRIGGER IF EXISTS update_user_action_permissions_updated_at ON user_action_permissions;

-- 2. Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can manage fornecedores" ON fornecedores;
DROP POLICY IF EXISTS "Users can manage empresas" ON empresas;
DROP POLICY IF EXISTS "Users can manage contas_pagar" ON contas_pagar;
DROP POLICY IF EXISTS "Users can manage contas_pagar_parcelas" ON contas_pagar_parcelas;
DROP POLICY IF EXISTS "Users can manage transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage verifications" ON verifications;
DROP POLICY IF EXISTS "Users can manage user_action_permissions" ON user_action_permissions;

-- 3. Desabilitar RLS antes de dropar tabelas
ALTER TABLE IF EXISTS fornecedores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contas_pagar DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contas_pagar_parcelas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_action_permissions DISABLE ROW LEVEL SECURITY;

-- 4. Dropar tabelas em ordem reversa de dependência
DROP TABLE IF EXISTS contas_pagar_parcelas CASCADE;
DROP TABLE IF EXISTS contas_pagar CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS user_action_permissions CASCADE;
DROP TABLE IF EXISTS fornecedores CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;

-- 5. Criar tabelas na ordem correta

-- Tabela de Fornecedores (sem dependências)
CREATE TABLE fornecedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj_cpf VARCHAR(20),
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    observacao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Empresas (sem dependências)
CREATE TABLE empresas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Contas a Pagar (depende de fornecedores e empresas)
CREATE TABLE contas_pagar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    empresa_nome VARCHAR(255),
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
    fornecedor_nome VARCHAR(255),
    valor_total DECIMAL(12,2) NOT NULL,
    quantidade_parcelas INTEGER NOT NULL DEFAULT 1,
    observacao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'pago', 'cancelado')),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Parcelas (depende de contas_pagar)
CREATE TABLE contas_pagar_parcelas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conta_pagar_id UUID NOT NULL,
    numero_parcela INTEGER NOT NULL,
    valor_parcela DECIMAL(12,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_pago DECIMAL(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'paga', 'vencida', 'cancelada')),
    observacao TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (conta_pagar_id) REFERENCES contas_pagar(id) ON DELETE CASCADE
);

-- Tabela de Transações (sem dependências)
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'saida', 'inicializacao')),
    value DECIMAL(12,2) NOT NULL,
    gaveta INTEGER,
    observation TEXT,
    obra VARCHAR(255),
    fornecedor VARCHAR(255),
    nota_numero VARCHAR(50),
    balance_before DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance_after DECIMAL(12,2) NOT NULL DEFAULT 0,
    difference DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Verificações (sem dependências)
CREATE TABLE verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    gaveta_value DECIMAL(12,2) NOT NULL,
    system_balance DECIMAL(12,2) NOT NULL,
    difference DECIMAL(12,2) NOT NULL DEFAULT 0,
    observation TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Permissões (sem dependências)
CREATE TABLE user_action_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    module VARCHAR(50) NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT false,
    can_create BOOLEAN NOT NULL DEFAULT false,
    can_edit BOOLEAN NOT NULL DEFAULT false,
    can_delete BOOLEAN NOT NULL DEFAULT false,
    can_export BOOLEAN NOT NULL DEFAULT false,
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module)
);

-- 6. Índices
CREATE INDEX idx_fornecedores_nome ON fornecedores(nome);
CREATE INDEX idx_fornecedores_ativo ON fornecedores(ativo);
CREATE INDEX idx_empresas_nome ON empresas(nome);
CREATE INDEX idx_contas_pagar_data_emissao ON contas_pagar(data_emissao);
CREATE INDEX idx_contas_pagar_empresa_id ON contas_pagar(empresa_id);
CREATE INDEX idx_contas_pagar_fornecedor_id ON contas_pagar(fornecedor_id);
CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX idx_contas_pagar_parcelas_conta_id ON contas_pagar_parcelas(conta_pagar_id);
CREATE INDEX idx_contas_pagar_parcelas_vencimento ON contas_pagar_parcelas(data_vencimento);
CREATE INDEX idx_contas_pagar_parcelas_status ON contas_pagar_parcelas(status);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_verifications_date ON verifications(date);
CREATE INDEX idx_user_action_permissions_user_id ON user_action_permissions(user_id);
CREATE INDEX idx_user_action_permissions_module ON user_action_permissions(module);

-- 7. Habilitar RLS
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_action_permissions ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de segurança
CREATE POLICY "Users can manage fornecedores" ON fornecedores
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage empresas" ON empresas
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage contas_pagar" ON contas_pagar
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage contas_pagar_parcelas" ON contas_pagar_parcelas
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage transactions" ON transactions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage verifications" ON verifications
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage user_action_permissions" ON user_action_permissions
    FOR ALL USING (auth.role() = 'authenticated');

-- 9. Triggers
CREATE TRIGGER update_fornecedores_updated_at 
    BEFORE UPDATE ON fornecedores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at 
    BEFORE UPDATE ON empresas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON contas_pagar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_pagar_parcelas_updated_at BEFORE UPDATE ON contas_pagar_parcelas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verifications_updated_at 
    BEFORE UPDATE ON verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_action_permissions_updated_at 
    BEFORE UPDATE ON user_action_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Tabelas essenciais criadas com sucesso!';
END $$;
