CREATE TABLE IF NOT EXISTS public.contas_bancarias (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_conta VARCHAR(255) NOT NULL,
    numero_conta VARCHAR(50) NOT NULL,
    digito_conta VARCHAR(10) NOT NULL,
    nome_banco VARCHAR(255) NOT NULL,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE RESTRICT,
    saldo_inicial NUMERIC(14,2) NOT NULL DEFAULT 0,
    data_saldo_inicial DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contas bancarias"
    ON public.contas_bancarias FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert contas bancarias"
    ON public.contas_bancarias FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update contas bancarias"
    ON public.contas_bancarias FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete contas bancarias"
    ON public.contas_bancarias FOR DELETE
    TO authenticated
    USING (true);

CREATE TRIGGER update_contas_bancarias_updated_at
    BEFORE UPDATE ON public.contas_bancarias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
