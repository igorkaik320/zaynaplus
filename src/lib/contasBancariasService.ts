import { supabase } from '@/integrations/supabase/client';

export interface ContaBancaria {
  id: string;
  nome_conta: string;
  numero_conta: string;
  digito_conta: string;
  nome_banco: string;
  empresa_id: string;
  saldo_inicial: number;
  data_saldo_inicial: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  empresas?: {
    nome: string;
  } | null;
}

export interface ContaBancariaPayload {
  nome_conta: string;
  numero_conta: string;
  digito_conta: string;
  nome_banco: string;
  empresa_id: string;
  saldo_inicial: number;
  data_saldo_inicial: string;
}

export async function fetchContasBancarias(): Promise<ContaBancaria[]> {
  const { data, error } = await supabase
    .from('contas_bancarias' as any)
    .select('*, empresas(nome)')
    .order('nome_conta');

  if (error) throw error;
  return (data || []) as ContaBancaria[];
}

export async function saveContaBancaria(conta: ContaBancariaPayload, userId: string) {
  const { data, error } = await supabase
    .from('contas_bancarias' as any)
    .insert({ ...conta, created_by: userId } as any)
    .select()
    .single();

  if (error) throw error;
  return data as ContaBancaria;
}

export async function updateContaBancaria(id: string, conta: Partial<ContaBancariaPayload>) {
  const { error } = await supabase
    .from('contas_bancarias' as any)
    .update({ ...conta, updated_at: new Date().toISOString() } as any)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteContaBancaria(id: string) {
  const { error } = await supabase.from('contas_bancarias' as any).delete().eq('id', id);
  if (error) throw error;
}
