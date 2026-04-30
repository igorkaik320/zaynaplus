-- Criar tabela transactions para controle de caixa
CREATE TABLE IF NOT EXISTS transactions (
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

-- Criar tabela de verificações de caixa
CREATE TABLE IF NOT EXISTS cash_verifications (
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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_cash_verifications_date ON cash_verifications(date);
CREATE INDEX IF NOT EXISTS idx_cash_verifications_created_by ON cash_verifications(created_by);

-- Habilitar Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_verifications ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para transactions
CREATE POLICY "Users can view transactions" ON transactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert transactions" ON transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update transactions" ON transactions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete transactions" ON transactions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de segurança para cash_verifications
CREATE POLICY "Users can view cash_verifications" ON cash_verifications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert cash_verifications" ON cash_verifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update cash_verifications" ON cash_verifications
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete cash_verifications" ON cash_verifications
    FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_verifications_updated_at 
    BEFORE UPDATE ON cash_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Tabelas transactions e cash_verifications criadas com sucesso!';
END $$;
