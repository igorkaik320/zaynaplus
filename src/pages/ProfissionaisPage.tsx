import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import {
  fetchProfissionais,
  saveProfissional,
  updateProfissional,
  deleteProfissional,
  Profissional,
} from '@/lib/clinicaService';

const empty = { nome: '', especialidade: '', taxa_comissao: 0, telefone: '', email: '', ativo: true };

export default function ProfissionaisPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Profissional[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Profissional | null>(null);
  const [form, setForm] = useState(empty);

  async function load() {
    try { setItems(await fetchProfissionais()); } catch (e: any) { toast.error(e.message); }
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(empty); setShowDialog(true); }
  function openEdit(p: Profissional) {
    setEditing(p);
    setForm({ nome: p.nome, especialidade: p.especialidade || '', taxa_comissao: p.taxa_comissao, telefone: p.telefone || '', email: p.email || '', ativo: p.ativo });
    setShowDialog(true);
  }
  async function handleSubmit() {
    if (!form.nome.trim()) return toast.error('Nome obrigatório');
    try {
      if (editing) await updateProfissional(editing.id, form as any);
      else await saveProfissional(form as any, user!.id);
      toast.success('Salvo'); setShowDialog(false); load();
    } catch (e: any) { toast.error(e.message); }
  }
  async function handleDelete(id: string) {
    if (!confirm('Excluir?')) return;
    try { await deleteProfissional(id); load(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profissionais</h1>
          <p className="text-sm text-muted-foreground">Equipe clínica</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Novo</Button>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />{p.nome}</div>
                </TableCell>
                <TableCell>{p.especialidade || '—'}</TableCell>
                <TableCell>{p.taxa_comissao}%</TableCell>
                <TableCell>{p.telefone || '—'}</TableCell>
                <TableCell>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.ativo ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Novo'} Profissional</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label>Nome *</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
            <div><Label>Especialidade</Label><Input value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} /></div>
            <div><Label>Comissão (%)</Label><Input type="number" value={form.taxa_comissao} onChange={(e) => setForm({ ...form, taxa_comissao: Number(e.target.value) })} /></div>
            <div><Label>Telefone</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="col-span-2 flex items-center gap-3"><Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} /><Label>Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}