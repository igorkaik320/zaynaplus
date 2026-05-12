import { useCallback, useEffect, useState } from 'react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AuditInfo from '@/components/AuditInfo';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useProfileMap } from '@/hooks/useProfileMap';
import { useAuth } from '@/lib/auth';
import {
  ContaBancaria,
  fetchContasBancarias,
  saveContaBancaria,
  updateContaBancaria,
  deleteContaBancaria,
} from '@/lib/contasBancariasService';
import { Empresa, fetchEmpresas } from '@/lib/empresasService';
import { formatCurrencyInput, formatCurrencyReal, formatDateSafe, parseCurrencyInput } from '@/lib/formatters';

const emptyForm = {
  nome_conta: '',
  numero_conta: '',
  digito_conta: '',
  nome_banco: '',
  empresa_id: '',
  saldo_inicial: '',
  data_saldo_inicial: new Date().toISOString().split('T')[0],
};

export default function ContasBancariasPage() {
  const { user } = useAuth();
  const { canCreate, canEdit, canDelete } = useModulePermissions();
  const [items, setItems] = useState<ContaBancaria[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const profileMap = useProfileMap();

  const load = useCallback(async () => {
    try {
      const empresasData = await fetchEmpresas();
      setEmpresas(empresasData);
    } catch (e: any) {
      toast.error(`Erro ao carregar empresas: ${e.message}`);
    }

    try {
      const contasData = await fetchContasBancarias();
      setItems(contasData);
    } catch (e: any) {
      toast.error(`Erro ao carregar contas bancarias: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.nome_conta.toLowerCase().includes(term) ||
      item.nome_banco.toLowerCase().includes(term) ||
      item.numero_conta.toLowerCase().includes(term) ||
      (item.empresas?.nome || '').toLowerCase().includes(term)
    );
  });

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowDialog(true);
  }

  function openEdit(item: ContaBancaria) {
    setEditingId(item.id);
    setForm({
      nome_conta: item.nome_conta,
      numero_conta: item.numero_conta,
      digito_conta: item.digito_conta,
      nome_banco: item.nome_banco,
      empresa_id: item.empresa_id,
      saldo_inicial: formatCurrencyInput(String(Math.round((item.saldo_inicial || 0) * 100))),
      data_saldo_inicial: item.data_saldo_inicial || new Date().toISOString().split('T')[0],
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!user) return;
    if (!form.nome_conta.trim()) {
      toast.error('Nome da conta e obrigatorio');
      return;
    }
    if (!form.numero_conta.trim()) {
      toast.error('Numero da conta e obrigatorio');
      return;
    }
    if (!form.digito_conta.trim()) {
      toast.error('Digito da conta e obrigatorio');
      return;
    }
    if (!form.nome_banco.trim()) {
      toast.error('Nome do banco e obrigatorio');
      return;
    }
    if (!form.empresa_id) {
      toast.error('Selecione uma empresa');
      return;
    }
    if (!form.data_saldo_inicial) {
      toast.error('Data do saldo inicial e obrigatoria');
      return;
    }

    const payload = {
      ...form,
      saldo_inicial: parseCurrencyInput(form.saldo_inicial),
    };

    try {
      if (editingId) {
        await updateContaBancaria(editingId, payload);
        toast.success('Conta bancaria atualizada');
      } else {
        await saveContaBancaria(payload, user.id);
        toast.success('Conta bancaria cadastrada');
      }
      setShowDialog(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta conta bancaria?')) return;

    try {
      await deleteContaBancaria(id);
      toast.success('Conta bancaria excluida');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Cadastro de Contas Bancarias</h2>
        {canCreate('contas_bancarias') && (
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-1 h-4 w-4" />
            Nova Conta
          </Button>
        )}
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por conta, banco, numero ou empresa..."
        className="max-w-md"
      />

      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Conta</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Digito</TableHead>
              <TableHead className="text-right">Saldo Inicial</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Auditoria</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  Carregando contas bancarias...
                </TableCell>
              </TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Nenhuma conta bancaria
                </TableCell>
              </TableRow>
            )}
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nome_conta}</TableCell>
                <TableCell>{item.nome_banco}</TableCell>
                <TableCell>{item.numero_conta}</TableCell>
                <TableCell>{item.digito_conta}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrencyReal(item.saldo_inicial || 0)}</TableCell>
                <TableCell>{formatDateSafe(item.data_saldo_inicial)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{item.empresas?.nome || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <AuditInfo
                    createdBy={item.created_by || undefined}
                    createdAt={item.created_at}
                    updatedAt={item.updated_at}
                    profileMap={profileMap}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {canEdit('contas_bancarias') && (
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete('contas_bancarias') && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar' : 'Nova'} Conta Bancaria</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <div>
              <Label>Nome da conta *</Label>
              <Input value={form.nome_conta} onChange={(e) => setForm((p) => ({ ...p, nome_conta: e.target.value }))} />
            </div>

            <div>
              <Label>Nome do banco *</Label>
              <Input value={form.nome_banco} onChange={(e) => setForm((p) => ({ ...p, nome_banco: e.target.value }))} />
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
              <div>
                <Label>Numero da conta *</Label>
                <Input value={form.numero_conta} onChange={(e) => setForm((p) => ({ ...p, numero_conta: e.target.value }))} />
              </div>
              <div>
                <Label>Digito *</Label>
                <Input value={form.digito_conta} onChange={(e) => setForm((p) => ({ ...p, digito_conta: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label>Saldo inicial *</Label>
                <Input
                  value={form.saldo_inicial}
                  onChange={(e) => setForm((p) => ({ ...p, saldo_inicial: formatCurrencyInput(e.target.value) }))}
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={form.data_saldo_inicial}
                  onChange={(e) => setForm((p) => ({ ...p, data_saldo_inicial: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Empresa *</Label>
              <Select value={form.empresa_id} onValueChange={(value) => setForm((p) => ({ ...p, empresa_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-muted-foreground">Nenhuma empresa encontrada</div>
                  ) : (
                    empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
