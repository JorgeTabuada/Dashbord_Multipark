import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Receipt, Plus, Trash2, Euro, Search, FileText, Clock,
  CheckCircle2, AlertCircle, XCircle, Eye, Pencil
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-700" },
  issued: { label: "Emitida", color: "bg-blue-100 text-blue-700" },
  paid: { label: "Paga", color: "bg-green-100 text-green-700" },
  overdue: { label: "Vencida", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelada", color: "bg-gray-100 text-gray-500" },
};

export default function InvoicesPage() {
  const { user } = useAuth();
  const filters = useGlobalFilters();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editInvoice, setEditInvoice] = useState<any>(null);

  const queryInput = useMemo(() => {
    const input: any = { month, year };
    if (filterStatus !== "all") input.status = filterStatus;
    if (search.trim()) input.search = search.trim();
    if (filters.projectId !== undefined) input.projectId = filters.projectId;
    return input;
  }, [month, year, filterStatus, search, filters.projectId]);

  const { data: invoices = [], isLoading } = trpc.invoices.list.useQuery(queryInput);
  const { data: stats } = trpc.invoices.stats.useQuery({ month, year });
  const updateMut = trpc.invoices.update.useMutation();
  const deleteMut = trpc.invoices.delete.useMutation();
  const utils = trpc.useUtils();

  const formatCents = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  const handleStatusChange = async (id: number, status: string) => {
    await updateMut.mutateAsync({ id, status });
    utils.invoices.list.invalidate();
    utils.invoices.stats.invalidate();
    toast.success("Estado atualizado");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar esta fatura?")) return;
    await deleteMut.mutateAsync({ id });
    utils.invoices.list.invalidate();
    utils.invoices.stats.invalidate();
    toast.success("Fatura eliminada");
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-muted-foreground">Gestão de faturas e pagamentos</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={String(month)} onValueChange={v => setMonth(parseInt(v))}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m, i) => (
                  <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || 2026)} className="w-24" />
            <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" /> Nova Fatura</Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2"><FileText className="w-4 h-4" /><span className="text-xs text-muted-foreground">Total</span></div>
              <p className="text-xl font-bold mt-1">{stats.total}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2"><Euro className="w-4 h-4 text-green-500" /><span className="text-xs text-muted-foreground">Valor Total</span></div>
              <p className="text-xl font-bold mt-1">{formatCents(stats.totalAmount)}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-xs text-muted-foreground">Pagas</span></div>
              <p className="text-xl font-bold mt-1 text-green-600">{stats.paid}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-xs text-muted-foreground">Vencidas</span></div>
              <p className="text-xl font-bold mt-1 text-red-600">{stats.overdue}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span className="text-xs text-muted-foreground">Rascunhos</span></div>
              <p className="text-xl font-bold mt-1">{stats.draft}</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar nº fatura, cliente, NIF..." className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : invoices.length === 0 ? (
          <Card className="p-10 text-center">
            <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Sem faturas neste período</p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Nº Fatura</th>
                  <th className="p-2">Cliente</th>
                  <th className="p-2">NIF</th>
                  <th className="p-2">Emissão</th>
                  <th className="p-2">Vencimento</th>
                  <th className="p-2 text-right">Valor</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2 w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{inv.invoiceNumber}</td>
                    <td className="p-2">{inv.clientName || "—"}</td>
                    <td className="p-2 text-xs">{inv.clientNif || "—"}</td>
                    <td className="p-2 text-xs">{new Date(inv.issueDate).toLocaleDateString("pt-PT")}</td>
                    <td className="p-2 text-xs">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("pt-PT") : "—"}</td>
                    <td className="p-2 text-right font-medium">{formatCents(inv.totalAmount)}</td>
                    <td className="p-2">
                      <Select value={inv.status} onValueChange={v => handleStatusChange(inv.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-28">
                          <Badge className={STATUS_CONFIG[inv.status]?.color}>{STATUS_CONFIG[inv.status]?.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditInvoice(inv)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(inv.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateInvoiceDialog onClose={() => setShowCreate(false)} />}
      {editInvoice && <EditInvoiceDialog invoice={editInvoice} onClose={() => setEditInvoice(null)} />}
    </>
  );
}

function CreateInvoiceDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    invoiceNumber: "",
    clientName: "",
    clientNif: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    totalAmount: "",
    taxAmount: "",
    status: "draft" as const,
    paymentMethod: "",
    notes: "",
  });
  const createMut = trpc.invoices.create.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    if (!form.invoiceNumber.trim()) { toast.error("Nº de fatura obrigatório"); return; }
    if (!form.totalAmount) { toast.error("Valor obrigatório"); return; }
    try {
      await createMut.mutateAsync({
        invoiceNumber: form.invoiceNumber,
        clientName: form.clientName || undefined,
        clientNif: form.clientNif || undefined,
        issueDate: form.issueDate,
        dueDate: form.dueDate || undefined,
        totalAmount: Math.round(parseFloat(form.totalAmount) * 100),
        taxAmount: form.taxAmount ? Math.round(parseFloat(form.taxAmount) * 100) : undefined,
        status: form.status,
        paymentMethod: form.paymentMethod || undefined,
        notes: form.notes || undefined,
      });
      utils.invoices.list.invalidate();
      utils.invoices.stats.invalidate();
      toast.success("Fatura criada");
      onClose();
    } catch (e: any) { toast.error(e.message || "Erro"); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nova Fatura</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nº Fatura *</Label>
              <Input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} placeholder="FT 2026/001" />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v: any) => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cliente</Label>
              <Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
            </div>
            <div>
              <Label>NIF</Label>
              <Input value={form.clientNif} onChange={e => setForm(f => ({ ...f, clientNif: e.target.value }))} />
            </div>
            <div>
              <Label>Data Emissão</Label>
              <Input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} />
            </div>
            <div>
              <Label>Data Vencimento</Label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <Label>Valor Total (€) *</Label>
              <Input type="number" step="0.01" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} />
            </div>
            <div>
              <Label>IVA (€)</Label>
              <Input type="number" step="0.01" value={form.taxAmount} onChange={e => setForm(f => ({ ...f, taxAmount: e.target.value }))} />
            </div>
            <div>
              <Label>Método Pagamento</Label>
              <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferência</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createMut.isPending}>{createMut.isPending ? "A criar..." : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function EditInvoiceDialog({ invoice, onClose }: { invoice: any; onClose: () => void }) {
  const [form, setForm] = useState({
    totalAmount: String((invoice.totalAmount / 100).toFixed(2)),
    taxAmount: invoice.taxAmount ? String((invoice.taxAmount / 100).toFixed(2)) : "",
    paymentMethod: invoice.paymentMethod || "",
    notes: invoice.notes || "",
    status: invoice.status || "draft",
  });
  const updateMut = trpc.invoices.update.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    try {
      await updateMut.mutateAsync({
        id: invoice.id,
        totalAmount: form.totalAmount ? Math.round(parseFloat(form.totalAmount) * 100) : undefined,
        taxAmount: form.taxAmount ? Math.round(parseFloat(form.taxAmount) * 100) : undefined,
        paymentMethod: form.paymentMethod || undefined,
        notes: form.notes || undefined,
        status: form.status || undefined,
      });
      utils.invoices.list.invalidate();
      utils.invoices.stats.invalidate();
      toast.success("Fatura atualizada");
      onClose();
    } catch (e: any) { toast.error(e.message || "Erro"); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Editar Fatura — {invoice.invoiceNumber}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="issued">Emitida</SelectItem>
                  <SelectItem value="paid">Paga</SelectItem>
                  <SelectItem value="overdue">Vencida</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Método Pagamento</Label>
              <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferência</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor Total (€)</Label>
              <Input type="number" step="0.01" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} />
            </div>
            <div>
              <Label>IVA (€)</Label>
              <Input type="number" step="0.01" value={form.taxAmount} onChange={e => setForm(f => ({ ...f, taxAmount: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={updateMut.isPending}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
