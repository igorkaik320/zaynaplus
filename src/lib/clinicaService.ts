import { supabase } from '@/integrations/supabase/client';

// ============ PACIENTES ============
export interface Paciente {
  id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  convenio: string | null;
  observacoes: string | null;
  observacoes_clinicas: string | null;
  created_at: string;
}

export async function fetchPacientes(): Promise<Paciente[]> {
  const { data, error } = await supabase.from('pacientes' as any).select('*').order('nome');
  if (error) throw error;
  return (data || []) as any;
}

export async function savePaciente(p: Partial<Paciente>, userId: string) {
  const { data, error } = await supabase
    .from('pacientes' as any)
    .insert({ ...p, created_by: userId } as any)
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

export async function updatePaciente(id: string, p: Partial<Paciente>) {
  const { error } = await supabase.from('pacientes' as any).update(p as any).eq('id', id);
  if (error) throw error;
}

export async function deletePaciente(id: string) {
  const { error } = await supabase.from('pacientes' as any).delete().eq('id', id);
  if (error) throw error;
}

// ============ PROFISSIONAIS ============
export interface Profissional {
  id: string;
  nome: string;
  especialidade: string | null;
  taxa_comissao: number;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
}

export async function fetchProfissionais(): Promise<Profissional[]> {
  const { data, error } = await supabase.from('profissionais' as any).select('*').order('nome');
  if (error) throw error;
  return (data || []) as any;
}

export async function saveProfissional(p: Partial<Profissional>, userId: string) {
  const { data, error } = await supabase
    .from('profissionais' as any)
    .insert({ ...p, created_by: userId } as any)
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

export async function updateProfissional(id: string, p: Partial<Profissional>) {
  const { error } = await supabase.from('profissionais' as any).update(p as any).eq('id', id);
  if (error) throw error;
}

export async function deleteProfissional(id: string) {
  const { error } = await supabase.from('profissionais' as any).delete().eq('id', id);
  if (error) throw error;
}

// ============ PROCEDIMENTOS ============
export interface Procedimento {
  id: string;
  nome: string;
  preco_padrao: number;
  duracao_media: number;
}

export async function fetchProcedimentos(): Promise<Procedimento[]> {
  const { data, error } = await supabase.from('procedimentos' as any).select('*').order('nome');
  if (error) throw error;
  return (data || []) as any;
}

export async function saveProcedimento(p: Partial<Procedimento>, userId: string) {
  const { data, error } = await supabase
    .from('procedimentos' as any)
    .insert({ ...p, created_by: userId } as any)
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

export async function updateProcedimento(id: string, p: Partial<Procedimento>) {
  const { error } = await supabase.from('procedimentos' as any).update(p as any).eq('id', id);
  if (error) throw error;
}

export async function deleteProcedimento(id: string) {
  const { error } = await supabase.from('procedimentos' as any).delete().eq('id', id);
  if (error) throw error;
}

// ============ AGENDAMENTOS ============
export type AgendamentoStatus = 'confirmed' | 'cancelled' | 'attended' | 'missed';

export interface Agendamento {
  id: string;
  paciente_id: string | null;
  paciente_nome: string;
  profissional_id: string | null;
  profissional_nome: string | null;
  procedimento_id: string | null;
  procedimento_nome: string | null;
  data: string;
  hora: string;
  duracao: number;
  valor: number;
  status: AgendamentoStatus;
  observacoes: string | null;
}

export async function fetchAgendamentos(): Promise<Agendamento[]> {
  const { data, error } = await supabase
    .from('agendamentos' as any)
    .select('*')
    .order('data', { ascending: true })
    .order('hora', { ascending: true });
  if (error) throw error;
  return (data || []) as any;
}

export async function saveAgendamento(a: Partial<Agendamento>, userId: string) {
  const { data, error } = await supabase
    .from('agendamentos' as any)
    .insert({ ...a, created_by: userId } as any)
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

export async function updateAgendamento(id: string, a: Partial<Agendamento>) {
  const { error } = await supabase.from('agendamentos' as any).update(a as any).eq('id', id);
  if (error) throw error;
}

export async function deleteAgendamento(id: string) {
  const { error } = await supabase.from('agendamentos' as any).delete().eq('id', id);
  if (error) throw error;
}

// ============ PRONTUARIOS ============
export interface Prontuario {
  id: string;
  paciente_id: string | null;
  paciente_nome: string;
  profissional_id: string | null;
  profissional_nome: string | null;
  data: string;
  queixa: string | null;
  diagnostico: string | null;
  procedimento_realizado: string | null;
  prescricao: string | null;
  observacoes: string | null;
  anexos: any[];
  created_at: string;
}

export async function fetchProntuarios(): Promise<Prontuario[]> {
  const { data, error } = await supabase
    .from('prontuarios' as any)
    .select('*')
    .order('data', { ascending: false });
  if (error) throw error;
  return (data || []) as any;
}

export async function saveProntuario(p: Partial<Prontuario>, userId: string) {
  const { data, error } = await supabase
    .from('prontuarios' as any)
    .insert({ ...p, created_by: userId } as any)
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

export async function updateProntuario(id: string, p: Partial<Prontuario>) {
  const { error } = await supabase.from('prontuarios' as any).update(p as any).eq('id', id);
  if (error) throw error;
}

export async function deleteProntuario(id: string) {
  const { error } = await supabase.from('prontuarios' as any).delete().eq('id', id);
  if (error) throw error;
}