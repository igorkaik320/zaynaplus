import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import {
  fetchProcedimentos,
  saveProcedimento,
  updateProcedimento,
  deleteProcedimento,
  Procedimento,
} from '@/lib/clinicaService';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/formatters';

const empty = { nome: '', preco: 'R$ 0,00', duracao: 30 };

export default function ProcedimentosPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Procedimento[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Procedimento | null>(null);
  const [form, setForm] = useState(empty);

  async function load() {
    try { setItems(await fetchProcedimentos()); } catch (e: any) { toast.error(e.message); }
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(empty); setShowDialog(true); }
  function openEdit(p: Procedimento) {
    setEditing(p);
    setForm({ nome: p.nome, preco: formatCurrencyInput(String(Math.round(p.preco_padrao * 100))), duracao: p.duracao_media });
    setShowDialog(true);
  }
  async function handleSubmit() {
    if (!form.nome.trim()) return toast.error('Nome obrigatório');
    const payload = { nome: form.nome, preco_padrao: parseCurrencyInput(form.preco), duracao_media: form.duracao };
    try {
      if (editing) await updateProcedimento(editing.id, payload);
      else await saveProcedimento(payload, user!.id);
      toast.success('Salvo'); setShowDialog(false); load();
    } catch (e: any) { toast.error(e.message); }
  }
  async function handleDelete(id: string) {
    if (!confirm('Excluir?')) return;
    try { await deleteProcedimento(id); load(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Procedimentos</h1>
          <p className="text-sm text-muted-foreground">Catálogo de procedimentos</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Novo</Button>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço padrão</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" />{p.nome}</div>
                </TableCell>
                <TableCell>{formatCurrency(p.preco_padrao)}</TableCell>
                <TableCell>{p.duracao_media}min</TableCell>
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
          <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Novo'} Procedimento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Preço padrão</Label><Input value={form.preco} onChange={(e) => setForm({ ...form, preco: formatCurrencyInput(e.target.value) })} /></div>
              <div><Label>Duração (min)</Label><Input type="number" value={form.duracao} onChange={(e) => setForm({ ...form, duracao: Number(e.target.value) })} /></div>
            </div>
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