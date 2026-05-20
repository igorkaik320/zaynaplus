import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/formatters';
import {
  fetchContasReceber,
  saveContaReceber,
  updateContaReceber,
  deleteContaReceber,
  saveParcelasReceber,
  gerarParcelasReceber,
  updateParcelasReceberStatus,
  ContaReceberComParcelas,
} from '@/lib/contasReceberService';
import { fetchPacientes, Paciente } from '@/lib/clinicaService';

const empty = {
  data_emissao: new Date().toISOString().split('T')[0],
  data_primeiro_vencimento: new Date().toISOString().split('T')[0],
  paciente_id: '',
  origem: '',
  valor_total: '',
  quantidade_parcelas: '1',
  observacao: '',
};

export default function ContasReceberPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ContaReceberComParcelas[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [viewing, setViewing] = useState<ContaReceberComParcelas | null>(null);

  async function load() {
    try {
      setLoading(true);
      const [c, p] = await Promise.all([fetchContasReceber(), fetchPacientes()]);
      setItems(c);
      setPacientes(p);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const allParcelas = useMemo(
    () =>
      items.flatMap((c) =>
        c.parcelas.map((p) => ({ ...p, conta: c })),
      ).sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento)),
    [items],
  );

  function openNew() {
    setEditingId(null);
    setForm(empty);
    setShowDialog(true);
  }

  function openEdit(c: ContaReceberComParcelas) {
    setEditingId(c.id);
    setForm({
      data_emissao: c.data_emissao,
      data_primeiro_vencimento: c.data_primeiro_vencimento || c.data_emissao,
      paciente_id: c.paciente_id || '',
      origem: c.origem || '',
      valor_total: formatCurrencyInput(String(Math.round(c.valor_total * 100))),
      quantidade_parcelas: String(c.quantidade_parcelas),
      observacao: c.observacao || '',
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.valor_total || !form.paciente_id) {
      toast.error('Preencha paciente e valor');
      return;
    }
    const paciente = pacientes.find((p) => p.id === form.paciente_id);
    const payload = {
      data_emissao: form.data_emissao,
      data_primeiro_vencimento: form.data_primeiro_vencimento,
      empresa_id: null,
      empresa_nome: null,
      paciente_id: paciente!.id,
      paciente_nome: paciente!.nome,
      origem: form.origem || null,
      valor_total: parseCurrencyInput(form.valor_total),
      quantidade_parcelas: Number(form.quantidade_parcelas),
      observacao: form.observacao || null,
      status: 'aberto' as const,
      created_by: user!.id,
    };
    try {
      if (editingId) {
        await updateContaReceber(editingId, payload, user!.id);
        toast.success('Conta atualizada');
      } else {
        const saved = await saveContaReceber(payload, user!.id);
        const parcelas = gerarParcelasReceber(
          saved.id,
          payload.valor_total,
          payload.quantidade_parcelas,
          form.data_primeiro_vencimento,
        );
        await saveParcelasReceber(parcelas, user!.id);
        toast.success('Conta cadastrada com parcelas');
      }
      setShowDialog(false);
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta conta e parcelas?')) return;
    try { await deleteContaReceber(id); load(); } catch (e: any) { toast.error(e.message); }
  }

  async function markReceived(parcelaId: string) {
    try {
      await updateParcelasReceberStatus([parcelaId], 'recebida', user!.id);
      toast.success('Marcado como recebido');
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  function statusBadge(status: string) {
    const map: Record<string, { label: string; cls: string }> = {
      aberta: { label: 'Aberta', cls: 'bg-primary/10 text-primary' },
      recebida: { label: 'Recebida', cls: 'bg-green-100 text-green-700' },
      vencida: { label: 'Vencida', cls: 'bg-destructive/10 text-destructive' },
      cancelada: { label: 'Cancelada', cls: 'bg-muted text-muted-foreground' },
    };
    const c = map[status] || map.aberta;
    return <span className={`rounded-full px-2 py-0.5 text-xs ${c.cls}`}>{c.label}</span>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contas a Receber</h1>
          <p className="text-sm text-muted-foreground">Entradas e parcelas a receber</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Nova Conta</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vencimento</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Parcela</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : allParcelas.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Nenhuma conta</TableCell></TableRow>
            ) : (
              allParcelas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{new Date(`${p.data_vencimento}T12:00:00`).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">{p.conta.paciente_nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.conta.origem || '—'}</TableCell>
                  <TableCell>{p.numero_parcela}/{p.conta.quantidade_parcelas}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(p.valor_parcela)}</TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                  <TableCell className="text-right">
                    {p.status !== 'recebida' && (
                      <Button size="icon" variant="ghost" onClick={() => markReceived(p.id)} title="Marcar como recebida">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p.conta)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(p.conta.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editingId ? 'Editar' : 'Nova'} Conta a Receber</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Emissão *</Label>
              <Input type="date" value={form.data_emissao} onChange={(e) => setForm({ ...form, data_emissao: e.target.value })} />
            </div>
            <div>
              <Label>1º Vencimento *</Label>
              <Input type="date" value={form.data_primeiro_vencimento} onChange={(e) => setForm({ ...form, data_primeiro_vencimento: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Paciente *</Label>
              <Select value={form.paciente_id} onValueChange={(v) => setForm({ ...form, paciente_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {pacientes.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Origem / Descrição</Label>
              <Input value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} placeholder="Ex: Consulta, Procedimento..." />
            </div>
            <div>
              <Label>Valor Total *</Label>
              <Input value={form.valor_total} onChange={(e) => setForm({ ...form, valor_total: formatCurrencyInput(e.target.value) })} placeholder="R$ 0,00" />
            </div>
            <div>
              <Label>Parcelas *</Label>
              <Select value={form.quantidade_parcelas} onValueChange={(v) => setForm({ ...form, quantidade_parcelas: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,8,10,12].map((n) => <SelectItem key={n} value={String(n)}>{n}x</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Observação</Label>
              <Textarea value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Salvar' : 'Cadastrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}