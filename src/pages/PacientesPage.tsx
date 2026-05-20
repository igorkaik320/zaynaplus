import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, User, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import {
  fetchPacientes,
  savePaciente,
  updatePaciente,
  deletePaciente,
  Paciente,
} from '@/lib/clinicaService';

const emptyForm = {
  nome: '',
  cpf: '',
  data_nascimento: '',
  telefone: '',
  email: '',
  endereco: '',
  convenio: 'Particular',
  observacoes: '',
  observacoes_clinicas: '',
};

export default function PacientesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Paciente | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    try {
      setLoading(true);
      setItems(await fetchPacientes());
    } catch (e: any) {
      toast.error('Erro: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter(
    (p) =>
      !search ||
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.cpf || '').includes(search) ||
      (p.telefone || '').includes(search),
  );

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowDialog(true);
  }

  function openEdit(p: Paciente) {
    setEditing(p);
    setForm({
      nome: p.nome,
      cpf: p.cpf || '',
      data_nascimento: p.data_nascimento || '',
      telefone: p.telefone || '',
      email: p.email || '',
      endereco: p.endereco || '',
      convenio: p.convenio || 'Particular',
      observacoes: p.observacoes || '',
      observacoes_clinicas: p.observacoes_clinicas || '',
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      const payload = {
        ...form,
        data_nascimento: form.data_nascimento || null,
      };
      if (editing) {
        await updatePaciente(editing.id, payload as any);
        toast.success('Paciente atualizado');
      } else {
        await savePaciente(payload as any, user!.id);
        toast.success('Paciente cadastrado');
      }
      setShowDialog(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir paciente?')) return;
    try {
      await deletePaciente(id);
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
          <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-sm text-muted-foreground">Cadastro de pacientes da clínica</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Paciente
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, CPF ou telefone..."
              className="pl-9"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Convênio</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Nenhum paciente
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      {p.nome}
                    </div>
                  </TableCell>
                  <TableCell>{p.cpf || '—'}</TableCell>
                  <TableCell>
                    {p.telefone && (
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" /> {p.telefone}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{p.convenio}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Novo'} Paciente</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <Label>CPF</Label>
              <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
            </div>
            <div>
              <Label>Data de nascimento</Label>
              <Input
                type="date"
                value={form.data_nascimento}
                onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            </div>
            <div>
              <Label>Convênio</Label>
              <Select value={form.convenio} onValueChange={(v) => setForm({ ...form, convenio: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Particular">Particular</SelectItem>
                  <SelectItem value="Unimed">Unimed</SelectItem>
                  <SelectItem value="Bradesco">Bradesco</SelectItem>
                  <SelectItem value="Amil">Amil</SelectItem>
                  <SelectItem value="SulAmérica">SulAmérica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Observações clínicas</Label>
              <Textarea
                value={form.observacoes_clinicas}
                onChange={(e) => setForm({ ...form, observacoes_clinicas: e.target.value })}
                placeholder="Alergias, condições prévias, etc."
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