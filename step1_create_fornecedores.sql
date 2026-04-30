-- PASSO 1: Criar apenas a tabela fornecedores
-- Execute este primeiro para garantir que a tabela base exista

DROP TABLE IF EXISTS fornecedores CASCADE;

CREATE TABLE fornecedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_fornecedor TEXT,
    razao_social TEXT,
    cnpj_cpf TEXT,
    banco TEXT,
    agencia TEXT,
    conta TEXT,
    celular TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_fornecedores_nome_fornecedor ON fornecedores(nome_fornecedor);

-- RLS
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;

-- Política
CREATE POLICY "Users can manage fornecedores" ON fornecedores
    FOR ALL USING (auth.role() = 'authenticated');

-- Trigger
CREATE TRIGGER update_fornecedores_updated_at 
    BEFORE UPDATE ON fornecedores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Teste
SELECT 'Tabela fornecedores criada com sucesso!' as status;
