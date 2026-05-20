import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, FileText, Search, Stethoscope, Pill, ClipboardList, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import {
  fetchProntuarios,
  saveProntuario,
  updateProntuario,
  deleteProntuario,
  fetchPacientes,
  fetchProfissionais,
  Prontuario,
  Paciente,
  Profissional,
} from '@/lib/clinicaService';

const emptyForm = {
  paciente_id: '',
  profissional_id: '',
  data: new Date().toISOString().split('T')[0],
  queixa: '',
  diagnostico: '',
  procedimento_realizado: '',
  prescricao: '',
  observacoes: '',
};

export default function ProntuariosPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Prontuario[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Prontuario | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    try {
      const [pr, pa, pf] = await Promise.all([fetchProntuarios(), fetchPacientes(), fetchProfissionais()]);
      setItems(pr);
      setPacientes(pa);
      setProfissionais(pf);
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter(
        (p) => !search || p.paciente_nome.toLowerCase().includes(search.toLowerCase()) ||
          (p.diagnostico || '').toLowerCase().includes(search.toLowerCase()),
      ),
    [items, search],
  );

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowDialog(true);
  }

  function openEdit(p: Prontuario) {
    setEditing(p);
    setForm({
      paciente_id: p.paciente_id || '',
      profissional_id: p.profissional_id || '',
      data: p.data,
      queixa: p.queixa || '',
      diagnostico: p.diagnostico || '',
      procedimento_realizado: p.procedimento_realizado || '',
      prescricao: p.prescricao || '',
      observacoes: p.observacoes || '',
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    const paciente = pacientes.find((p) => p.id === form.paciente_id);
    const profissional = profissionais.find((p) => p.id === form.profissional_id);
    if (!paciente) {
      toast.error('Selecione o paciente');
      return;
    }
    const payload = {
      paciente_id: paciente.id,
      paciente_nome: paciente.nome,
      profissional_id: profissional?.id || null,
      profissional_nome: profissional?.nome || null,
      data: form.data,
      queixa: form.queixa || null,
      diagnostico: form.diagnostico || null,
      procedimento_realizado: form.procedimento_realizado || null,
      prescricao: form.prescricao || null,
      observacoes: form.observacoes || null,
    };
    try {
      if (editing) {
        await updateProntuario(editing.id, payload as any);
        toast.success('Prontuário atualizado');
      } else {
        await saveProntuario(payload as any, user!.id);
        toast.success('Prontuário criado');
      }
      setShowDialog(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir prontuário?')) return;
    try {
      await deleteProntuario(id);
      toast.success('Excluído');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prontuário</h1>
          <p className="text-sm text-muted-foreground">Registros clínicos dos pacientes</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Registro
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por paciente ou diagnóstico..."
          className="pl-9"
        />
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
            Nenhum prontuário cadastrado
          </Card>
        ) : (
          filtered.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{p.paciente_nome}</h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(`${p.data}T12:00:00`).toLocaleDateString('pt-BR')}
                    </span>
                    {p.profissional_nome && (
                      <span className="text-xs text-muted-foreground">· {p.profissional_nome}</span>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 text-sm">
                    {p.queixa && (
                      <div className="flex gap-2">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">Queixa: </span>
                          {p.queixa}
                        </div>
                      </div>
                    )}
                    {p.diagnostico && (
                      <div className="flex gap-2">
                        <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">Diagnóstico: </span>
                          {p.diagnostico}
                        </div>
                      </div>
                    )}
                    {p.procedimento_realizado && (
                      <div className="flex gap-2">
                        <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">Procedimento: </span>
                          {p.procedimento_realizado}
                        </div>
                      </div>
                    )}
                    {p.prescricao && (
                      <div className="flex gap-2">
                        <Pill className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">Prescrição: </span>
                          {p.prescricao}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Novo'} Registro Clínico</DialogTitle>
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
              <Label>Data</Label>
              <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Queixa principal</Label>
              <Textarea value={form.queixa} onChange={(e) => setForm({ ...form, queixa: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Diagnóstico</Label>
              <Textarea
                value={form.diagnostico}
                onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Procedimento realizado</Label>
              <Textarea
                value={form.procedimento_realizado}
                onChange={(e) => setForm({ ...form, procedimento_realizado: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Prescrição</Label>
              <Textarea value={form.prescricao} onChange={(e) => setForm({ ...form, prescricao: e.target.value })} />
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
            <Button onClick={handleSubmit}>{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}