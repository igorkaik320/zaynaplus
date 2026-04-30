-- PASSO 2: Criar tabela empresas
-- Execute depois que step1 funcionar

DROP TABLE IF EXISTS empresas CASCADE;

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

-- Índice
CREATE INDEX idx_empresas_nome ON empresas(nome);

-- RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Política
CREATE POLICY "Users can manage empresas" ON empresas
    FOR ALL USING (auth.role() = 'authenticated');

-- Trigger
CREATE TRIGGER update_empresas_updated_at 
    BEFORE UPDATE ON empresas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Teste
SELECT 'Tabela empresas criada com sucesso!' as status;
