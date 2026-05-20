import { supabase } from '@/integrations/supabase/client';

export interface ContaReceber {
  id: string;
  data_emissao: string;
  data_primeiro_vencimento: string | null;
  empresa_id: string | null;
  empresa_nome: string | null;
  paciente_id: string | null;
  paciente_nome: string | null;
  origem: string | null;
  valor_total: number;
  quantidade_parcelas: number;
  observacao: string | null;
  status: 'aberto' | 'recebido' | 'cancelado';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContaReceberParcela {
  id: string;
  conta_receber_id: string;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  data_recebimento: string | null;
  valor_recebido: number | null;
  status: 'aberta' | 'recebida' | 'vencida' | 'cancelada';
  observacao: string | null;
}

export interface ContaReceberComParcelas extends ContaReceber {
  parcelas: ContaReceberParcela[];
}

export async function fetchContasReceber(): Promise<ContaReceberComParcelas[]> {
  const { data, error } = await supabase
    .from('contas_receber' as any)
    .select(`*, contas_receber_parcelas(*)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((item: any) => ({
    ...item,
    parcelas: item.contas_receber_parcelas || [],
  }));
}

export async function saveContaReceber(
  conta: Omit<ContaReceber, 'id' | 'created_at' | 'updated_at'>,
  userId: string,
) {
  const { data, error } = await supabase
    .from('contas_receber' as any)
    .insert({ ...conta, created_by: userId } as any)
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

export async function updateContaReceber(id: string, conta: Partial<ContaReceber>, userId: string) {
  const { error } = await supabase
    .from('contas_receber' as any)
    .update({ ...conta, updated_by: userId } as any)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteContaReceber(id: string) {
  const { error } = await supabase.from('contas_receber' as any).delete().eq('id', id);
  if (error) throw error;
}

export async function saveParcelasReceber(
  parcelas: Omit<ContaReceberParcela, 'id'>[],
  userId: string,
) {
  const limpos = parcelas.map((p) => ({ ...p, created_by: userId }));
  const { error } = await supabase.from('contas_receber_parcelas' as any).insert(limpos as any);
  if (error) throw error;
}

export async function updateParcelasReceberStatus(ids: string[], status: string, userId: string) {
  const updates: any = { status, updated_by: userId };
  if (status === 'recebida') updates.data_recebimento = new Date().toISOString().split('T')[0];
  const { error } = await supabase
    .from('contas_receber_parcelas' as any)
    .update(updates)
    .in('id', ids);
  if (error) throw error;
}

export function gerarParcelasReceber(
  contaId: string,
  valorTotal: number,
  quantidade: number,
  dataPrimeira: string,
): Omit<ContaReceberParcela, 'id'>[] {
  const parcelas: Omit<ContaReceberParcela, 'id'>[] = [];
  const valor = Math.round((valorTotal / quantidade) * 100) / 100;
  const ultima = Math.round((valorTotal - valor * (quantidade - 1)) * 100) / 100;
  for (let i = 1; i <= quantidade; i++) {
    const d = new Date(`${dataPrimeira}T00:00:00`);
    d.setMonth(d.getMonth() + (i - 1));
    parcelas.push({
      conta_receber_id: contaId,
      numero_parcela: i,
      valor_parcela: i === quantidade ? ultima : valor,
      data_vencimento: d.toISOString().split('T')[0],
      data_recebimento: null,
      valor_recebido: null,
      status: 'aberta',
      observacao: null,
    });
  }
  return parcelas;
}