-- Criar tabelas que estão faltando no banco de dados

-- 1. Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
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

-- 2. Tabela de Permissões de Ação do Usuário
CREATE TABLE IF NOT EXISTS user_action_permissions (
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

-- 3. Tabela de Verificações (renomear cash_verifications para verifications)
CREATE TABLE IF NOT EXISTS verifications (
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

-- 4. Tabela de Empresas (referenciada em contas_pagar)
CREATE TABLE IF NOT EXISTS empresas (
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

-- 5. Tabela de Obras (referenciada em várias outras tabelas)
CREATE TABLE IF NOT EXISTS obras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cliente VARCHAR(255),
    endereco TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'suspensa', 'cancelada')),
    valor_orcado DECIMAL(12,2),
    data_inicio DATE,
    data_previsao_termino DATE,
    observacao TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Responsáveis (referenciada em equipamentos)
CREATE TABLE IF NOT EXISTS responsaveis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    cargo VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Veículos/Máquinas
CREATE TABLE IF NOT EXISTS veiculos_maquinas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('veiculo', 'maquina')),
    placa VARCHAR(20),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    ano INTEGER,
    cor VARCHAR(50),
    combustivel VARCHAR(50),
    capacidade_tanque DECIMAL(8,2),
    hodometro_atual INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'manutencao', 'inativo', 'vendido')),
    observacao TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Postos de Combustível
CREATE TABLE IF NOT EXISTS postos_combustivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    bandeira VARCHAR(100),
    endereco TEXT,
    telefone VARCHAR(20),
    preco_gasolina DECIMAL(8,3),
    preco_etanol DECIMAL(8,3),
    preco_diesel DECIMAL(8,3),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabela de Tipos de Combustível
CREATE TABLE IF NOT EXISTS tipos_combustivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabela de Abastecimentos
CREATE TABLE IF NOT EXISTS abastecimentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    veiculo_maquina_id UUID REFERENCES veiculos_maquinas(id) NOT NULL,
    veiculo_maquina_nome VARCHAR(255) NOT NULL,
    posto_combustivel_id UUID REFERENCES postos_combustivel(id),
    posto_combustivel_nome VARCHAR(255),
    tipo_combustivel_id UUID REFERENCES tipos_combustivel(id),
    tipo_combustivel_nome VARCHAR(50) NOT NULL,
    litros DECIMAL(8,2) NOT NULL,
    valor_unitario DECIMAL(8,3) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    hodometro INTEGER,
    observacao TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Tabela de Serviços de Máquinas
CREATE TABLE IF NOT EXISTS servicos_maquinas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    valor_mao_obra DECIMAL(10,2),
    valor_material DECIMAL(10,2),
    valor_total DECIMAL(10,2),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Tabela de Componentes/Peças
CREATE TABLE IF NOT EXISTS componentes_maquinas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50),
    descricao TEXT,
    fabricante VARCHAR(100),
    valor_unitario DECIMAL(10,2),
    estoque_minimo INTEGER DEFAULT 0,
    estoque_atual INTEGER DEFAULT 0,
    unidade_medida VARCHAR(20) DEFAULT 'UN',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_fornecedores_nome ON fornecedores(nome);
CREATE INDEX IF NOT EXISTS idx_fornecedores_ativo ON fornecedores(ativo);
CREATE INDEX IF NOT EXISTS idx_user_action_permissions_user_id ON user_action_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_action_permissions_module ON user_action_permissions(module);
CREATE INDEX IF NOT EXISTS idx_verifications_date ON verifications(date);
CREATE INDEX IF NOT EXISTS idx_empresas_nome ON empresas(nome);
CREATE INDEX IF NOT EXISTS idx_obras_nome ON obras(nome);
CREATE INDEX IF NOT EXISTS idx_obras_status ON obras(status);
CREATE INDEX IF NOT EXISTS idx_responsaveis_nome ON responsaveis(nome);
CREATE INDEX IF NOT EXISTS idx_veiculos_maquinas_nome ON veiculos_maquinas(nome);
CREATE INDEX IF NOT EXISTS idx_veiculos_maquinas_tipo ON veiculos_maquinas(tipo);
CREATE INDEX IF NOT EXISTS idx_postos_combustivel_nome ON postos_combustivel(nome);
CREATE INDEX IF NOT EXISTS idx_tipos_combustivel_nome ON tipos_combustivel(nome);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_data ON abastecimentos(data);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_veiculo ON abastecimentos(veiculo_maquina_id);
CREATE INDEX IF NOT EXISTS idx_servicos_maquinas_nome ON servicos_maquinas(nome);
CREATE INDEX IF NOT EXISTS idx_componentes_maquinas_nome ON componentes_maquinas(nome);

-- Habilitar Row Level Security (RLS) para todas as tabelas
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_action_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos_maquinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE postos_combustivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_combustivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos_maquinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE componentes_maquinas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para fornecedores
CREATE POLICY "Users can view fornecedores" ON fornecedores
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert fornecedores" ON fornecedores
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update fornecedores" ON fornecedores
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete fornecedores" ON fornecedores
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de segurança para user_action_permissions
CREATE POLICY "Users can view user_action_permissions" ON user_action_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage user_action_permissions" ON user_action_permissions
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas de segurança para verifications
CREATE POLICY "Users can view verifications" ON verifications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert verifications" ON verifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update verifications" ON verifications
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete verifications" ON verifications
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de segurança para empresas
CREATE POLICY "Users can view empresas" ON empresas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert empresas" ON empresas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update empresas" ON empresas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete empresas" ON empresas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de segurança para obras
CREATE POLICY "Users can view obras" ON obras
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert obras" ON obras
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update obras" ON obras
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete obras" ON obras
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de segurança para responsaveis
CREATE POLICY "Users can view responsaveis" ON responsaveis
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert responsaveis" ON responsaveis
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update responsaveis" ON responsaveis
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete responsaveis" ON responsaveis
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de segurança para veiculos_maquinas
CREATE POLICY "Users can view veiculos_maquinas" ON veiculos_maquinas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert veiculos_maquinas" ON veiculos_maquinas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update veiculos_maquinas" ON veiculos_maquinas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete veiculos_maquinas" ON veiculos_maquinas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de segurança para postos_combustivel
CREATE POLICY "Users can view postos_combustivel" ON postos_combustivel
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert postos_combustivel" ON postos_combustivel
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update postos_combustivel" ON postos_combustivel
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete postos_combustivel" ON postos_combustivel
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de segurança para tipos_combustivel
CREATE POLICY "Users can view tipos_combustivel" ON tipos_combustivel
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert tipos_combustivel" ON tipos_combustivel
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update tipos_combustivel" ON tipos_combustivel
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete tipos_combustivel" ON tipos_combustivel
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de segurança para abastecimentos
CREATE POLICY "Users can view abastecimentos" ON abastecimentos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert abastecimentos" ON abastecimentos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update abastecimentos" ON abastecimentos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete abastecimentos" ON abastecimentos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de segurança para servicos_maquinas
CREATE POLICY "Users can view servicos_maquinas" ON servicos_maquinas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert servicos_maquinas" ON servicos_maquinas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update servicos_maquinas" ON servicos_maquinas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete servicos_maquinas" ON servicos_maquinas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de segurança para componentes_maquinas
CREATE POLICY "Users can view componentes_maquinas" ON componentes_maquinas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert componentes_maquinas" ON componentes_maquinas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update componentes_maquinas" ON componentes_maquinas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete componentes_maquinas" ON componentes_maquinas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_fornecedores_updated_at 
    BEFORE UPDATE ON fornecedores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_action_permissions_updated_at 
    BEFORE UPDATE ON user_action_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verifications_updated_at 
    BEFORE UPDATE ON verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at 
    BEFORE UPDATE ON empresas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obras_updated_at 
    BEFORE UPDATE ON obras 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responsaveis_updated_at 
    BEFORE UPDATE ON responsaveis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_veiculos_maquinas_updated_at 
    BEFORE UPDATE ON veiculos_maquinas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_postos_combustivel_updated_at 
    BEFORE UPDATE ON postos_combustivel 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipos_combustivel_updated_at 
    BEFORE UPDATE ON tipos_combustivel 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_abastecimentos_updated_at 
    BEFORE UPDATE ON abastecimentos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_maquinas_updated_at 
    BEFORE UPDATE ON servicos_maquinas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_componentes_maquinas_updated_at 
    BEFORE UPDATE ON componentes_maquinas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Todas as tabelas faltantes foram criadas com sucesso!';
END $$;
