-- PASSO 4: Criar tabelas de controle de caixa
-- Execute depois que steps 1-3 funcionarem

DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS user_action_permissions CASCADE;

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

-- Índices
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_verifications_date ON verifications(date);
CREATE INDEX idx_user_action_permissions_user_id ON user_action_permissions(user_id);
CREATE INDEX idx_user_action_permissions_module ON user_action_permissions(module);

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_action_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can manage transactions" ON transactions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage verifications" ON verifications
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage user_action_permissions" ON user_action_permissions
    FOR ALL USING (auth.role() = 'authenticated');

-- Triggers
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verifications_updated_at 
    BEFORE UPDATE ON verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_action_permissions_updated_at 
    BEFORE UPDATE ON user_action_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Teste
SELECT 'Tabelas de caixa criadas com sucesso!' as status;
