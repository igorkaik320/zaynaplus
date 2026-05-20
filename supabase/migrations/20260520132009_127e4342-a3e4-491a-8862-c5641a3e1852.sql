
-- =========== PACIENTES ===========
CREATE TABLE public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT,
  data_nascimento DATE,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  convenio TEXT DEFAULT 'Particular',
  observacoes TEXT,
  observacoes_clinicas TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage pacientes" ON public.pacientes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========== PROFISSIONAIS ===========
CREATE TABLE public.profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  especialidade TEXT,
  taxa_comissao NUMERIC NOT NULL DEFAULT 0,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage profissionais" ON public.profissionais FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========== PROCEDIMENTOS ===========
CREATE TABLE public.procedimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  preco_padrao NUMERIC NOT NULL DEFAULT 0,
  duracao_media INTEGER NOT NULL DEFAULT 30,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.procedimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage procedimentos" ON public.procedimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========== AGENDAMENTOS ===========
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  paciente_nome TEXT NOT NULL,
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
  profissional_nome TEXT,
  procedimento_id UUID REFERENCES public.procedimentos(id) ON DELETE SET NULL,
  procedimento_nome TEXT,
  data DATE NOT NULL,
  hora TEXT NOT NULL,
  duracao INTEGER NOT NULL DEFAULT 30,
  valor NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmed',
  observacoes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_agendamentos_data ON public.agendamentos(data);
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage agendamentos" ON public.agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========== PRONTUARIOS ===========
CREATE TABLE public.prontuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  paciente_nome TEXT NOT NULL,
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
  profissional_nome TEXT,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  queixa TEXT,
  diagnostico TEXT,
  procedimento_realizado TEXT,
  prescricao TEXT,
  observacoes TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prontuarios_paciente ON public.prontuarios(paciente_id);
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage prontuarios" ON public.prontuarios FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========== CONTAS A RECEBER ===========
CREATE TABLE public.contas_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_primeiro_vencimento DATE,
  empresa_id UUID,
  empresa_nome TEXT,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  paciente_nome TEXT,
  origem TEXT,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  quantidade_parcelas INTEGER NOT NULL DEFAULT 1,
  observacao TEXT,
  status TEXT NOT NULL DEFAULT 'aberto',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage contas_receber" ON public.contas_receber FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.contas_receber_parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_receber_id UUID NOT NULL REFERENCES public.contas_receber(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor_parcela NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  valor_recebido NUMERIC,
  status TEXT NOT NULL DEFAULT 'aberta',
  observacao TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contas_receber_parcelas_conta ON public.contas_receber_parcelas(conta_receber_id);
ALTER TABLE public.contas_receber_parcelas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth manage contas_receber_parcelas" ON public.contas_receber_parcelas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Triggers updated_at
CREATE TRIGGER tr_pacientes_updated BEFORE UPDATE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_profissionais_updated BEFORE UPDATE ON public.profissionais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_procedimentos_updated BEFORE UPDATE ON public.procedimentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_agendamentos_updated BEFORE UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_prontuarios_updated BEFORE UPDATE ON public.prontuarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_contas_receber_updated BEFORE UPDATE ON public.contas_receber FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_contas_receber_parcelas_updated BEFORE UPDATE ON public.contas_receber_parcelas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
