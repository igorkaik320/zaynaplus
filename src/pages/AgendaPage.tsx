import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import {
  fetchAgendamentos,
  saveAgendamento,
  updateAgendamento,
  deleteAgendamento,
  fetchPacientes,
  fetchProfissionais,
  fetchProcedimentos,
  Agendamento,
  AgendamentoStatus,
  Paciente,
  Profissional,
  Procedimento,
} from '@/lib/clinicaService';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/formatters';

const statusLabels: Record<AgendamentoStatus, string> = {
  confirmed: 'Confirmado',
  attended: 'Compareceu',
  cancelled: 'Cancelado',
  missed: 'Faltou',
};
const statusColors: Record<AgendamentoStatus, string> = {
  confirmed: 'border-l-primary bg-primary/5',
  attended: 'border-l-green-500 bg-green-50',
  cancelled: 'border-l-destructive bg-destructive/5',
  missed: 'border-l-amber-500 bg-amber-50',
};
const statusBadge: Record<AgendamentoStatus, string> = {
  confirmed: 'bg-primary/10 text-primary',
  attended: 'bg-green-100 text-green-700',
  cancelled: 'bg-destructive/10 text-destructive',
  missed: 'bg-amber-100 text-amber-700',
};

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function formatDateLong(d: string) {
  return new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const emptyForm = {
  paciente_id: '',
  profissional_id: '',
  procedimento_id: '',
  data: todayISO(),
  hora: '09:00',
  duracao: 30,
  valor: '',
  status: 'confirmed' as AgendamentoStatus,
  observacoes: '',
};

export default function AgendaPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Agendamento[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [currentDate, setCurrentDate] = useState(todayISO());
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Agendamento | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    try {
      const [ag, pa, pr, pc] = await Promise.all([
        fetchAgendamentos(),
        fetchPacientes(),
        fetchProfissionais(),
        fetchProcedimentos(),
      ]);
      setItems(ag);
      setPacientes(pa);
      setProfissionais(pr.filter((x) => x.ativo));
      setProcedimentos(pc);
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const dayItems = useMemo(
    () => items.filter((i) => i.data === currentDate).sort((a, b) => a.hora.localeCompare(b.hora)),
    [items, currentDate],
  );

  function changeDay(delta: number) {
    const d = new Date(`${currentDate}T12:00:00`);
    d.setDate(d.getDate() + delta);
    setCurrentDate(d.toISOString().split('T')[0]);
  }

  function openNew(hora?: string) {
    setEditing(null);
    setForm({ ...emptyForm, data: currentDate, hora: hora || '09:00' });
    setShowDialog(true);
  }

  function openEdit(a: Agendamento) {
    setEditing(a);
    setForm({
      paciente_id: a.paciente_id || '',
      profissional_id: a.profissional_id || '',
      procedimento_id: a.procedimento_id || '',
      data: a.data,
      hora: a.hora,
      duracao: a.duracao,
      valor: formatCurrencyInput(String(Math.round(a.valor * 100))),
      status: a.status,
      observacoes: a.observacoes || '',
    });
    setShowDialog(true);
  }

  function selectProcedimento(id: string) {
    const proc = procedimentos.find((p) => p.id === id);
    setForm((f) => ({
      ...f,
      procedimento_id: id,
      valor: proc ? formatCurrencyInput(String(Math.round(proc.preco_padrao * 100))) : f.valor,
      duracao: proc?.duracao_media || f.duracao,
    }));
  }

  async function handleSubmit() {
    const paciente = pacientes.find((p) => p.id === form.paciente_id);
    const profissional = profissionais.find((p) => p.id === form.profissional_id);
    const procedimento = procedimentos.find((p) => p.id === form.procedimento_id);
    if (!paciente) {
      toast.error('Selecione o paciente');
      return;
    }
    const payload = {
      paciente_id: paciente.id,
      paciente_nome: paciente.nome,
      profissional_id: profissional?.id || null,
      profissional_nome: profissional?.nome || null,
      procedimento_id: procedimento?.id || null,
      procedimento_nome: procedimento?.nome || null,
      data: form.data,
      hora: form.hora,
      duracao: form.duracao,
      valor: parseCurrencyInput(form.valor),
      status: form.status,
      observacoes: form.observacoes || null,
    };
    try {
      if (editing) {
        await updateAgendamento(editing.id, payload as any);
        toast.success('Agendamento atualizado');
      } else {
        await saveAgendamento(payload as any, user!.id);
        toast.success('Agendamento criado');
      }
      setShowDialog(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir agendamento?')) return;
    try {
      await deleteAgendamento(id);
      toast.success('Excluído');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function quickStatus(id: string, status: AgendamentoStatus) {
    try {
      await updateAgendamento(id, { status });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground capitalize">{formatDateLong(currentDate)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeDay(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" size="icon" onClick={() => changeDay(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(todayISO())}>
            Hoje
          </Button>
          <Button onClick={() => openNew()} className="gap-2">
            <Plus className="h-4 w-4" /> Novo
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y">
          {timeSlots.map((slot) => {
            const slotItems = dayItems.filter((i) => i.hora.startsWith(slot.slice(0, 2)));
            return (
              <div key={slot} className="flex min-h-[70px]">
                <div className="flex w-20 shrink-0 items-start justify-center bg-muted/30 pt-3 text-sm font-medium text-muted-foreground">
                  {slot}
                </div>
                <div className="flex-1 space-y-2 p-2">
                  {slotItems.length === 0 ? (
                    <button
                      onClick={() => openNew(slot)}
                      className="flex h-full min-h-[60px] w-full items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground hover:bg-muted/30"
                    >
                      + adicionar
                    </button>
                  ) : (
                    slotItems.map((a) => (
                      <div
                        key={a.id}
                        className={`flex items-start justify-between gap-3 rounded-lg border-l-4 p-3 ${
                          statusColors[a.status]
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{a.paciente_nome}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${statusBadge[a.status]}`}>
                              {statusLabels[a.status]}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {a.hora} · {a.duracao}min
                            </span>
                            {a.procedimento_nome && <span>{a.procedimento_nome}</span>}
                            {a.profissional_nome && <span>com {a.profissional_nome}</span>}
                            {a.valor > 0 && <span>{formatCurrency(a.valor)}</span>}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {a.status === 'confirmed' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => quickStatus(a.id, 'attended')}>
                                ✓
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => quickStatus(a.id, 'missed')}>
                                ✗
                              </Button>
                            </>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => openEdit(a)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Novo'} Agendamento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Paciente *</Label>
              <Select value={form.paciente_id} onValueChange={(v) => setForm({ ...form, paciente_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Profissional</Label>
              <Select value={form.profissional_id} onValueChange={(v) => setForm({ ...form, profissional_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Procedimento</Label>
              <Select value={form.procedimento_id} onValueChange={selectProcedimento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {procedimentos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data</Label>
              <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
            <div>
              <Label>Horário</Label>
              <Input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
            </div>
            <div>
              <Label>Duração (min)</Label>
              <Input
                type="number"
                value={form.duracao}
                onChange={(e) => setForm({ ...form, duracao: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Valor</Label>
              <Input
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: formatCurrencyInput(e.target.value) })}
                placeholder="R$ 0,00"
              />
            </div>
            <div className="col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AgendamentoStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="attended">Compareceu</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="missed">Faltou</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>{editing ? 'Salvar' : 'Agendar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}