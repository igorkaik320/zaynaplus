-- PASSO 3: Criar tabelas de contas a pagar
-- Execute depois que step1 e step2 funcionarem

DROP TABLE IF EXISTS contas_pagar_parcelas CASCADE;
DROP TABLE IF EXISTS contas_pagar CASCADE;

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

-- Índices
CREATE INDEX idx_contas_pagar_data_emissao ON contas_pagar(data_emissao);
CREATE INDEX idx_contas_pagar_empresa_id ON contas_pagar(empresa_id);
CREATE INDEX idx_contas_pagar_fornecedor_id ON contas_pagar(fornecedor_id);
CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX idx_contas_pagar_parcelas_conta_id ON contas_pagar_parcelas(conta_pagar_id);
CREATE INDEX idx_contas_pagar_parcelas_vencimento ON contas_pagar_parcelas(data_vencimento);
CREATE INDEX idx_contas_pagar_parcelas_status ON contas_pagar_parcelas(status);

-- RLS
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar_parcelas ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can manage contas_pagar" ON contas_pagar
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage contas_pagar_parcelas" ON contas_pagar_parcelas
    FOR ALL USING (auth.role() = 'authenticated');

-- Triggers
CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON contas_pagar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_pagar_parcelas_updated_at BEFORE UPDATE ON contas_pagar_parcelas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Teste
SELECT 'Tabelas contas_pagar criadas com sucesso!' as status;
