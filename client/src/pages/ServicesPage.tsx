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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Sparkles, Plus, Trash2, Euro, TrendingUp, Users, Droplets, Zap, Car, Pencil
} from "lucide-react";

const SERVICE_TYPES: Record<string, { label: string; icon: any; color: string }> = {
  lavagem: { label: "Lavagem", icon: Droplets, color: "text-blue-500" },
  carregamento_eletrico: { label: "Carregamento Elétrico", icon: Zap, color: "text-green-500" },
  valet_flex: { label: "Valet Flex", icon: Car, color: "text-purple-500" },
  outro: { label: "Outro", icon: Sparkles, color: "text-gray-500" },
};

export default function ServicesPage() {
  const { user } = useAuth();
  const filters = useGlobalFilters();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showCreate, setShowCreate] = useState(false);
  const [editService, setEditService] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  const queryInput = useMemo(() => {
    const input: any = { month, year };
    if (activeTab !== "all") input.serviceType = activeTab;
    if (filters.projectId !== undefined) input.projectId = filters.projectId;
    return input;
  }, [month, year, activeTab, filters.projectId]);

  const { data: services = [], isLoading } = trpc.services.list.useQuery(queryInput);
  const { data: stats } = trpc.services.stats.useQuery({ month, year });
  const deleteMut = trpc.services.delete.useMutation();
  const utils = trpc.useUtils();
  const { data: employees = [] } = trpc.rh.list.useQuery();

  const employeeMap = useMemo(() => {
    const map = new Map<number, string>();
    employees.forEach((e: any) => map.set(e.id, e.fullName));
    return map;
  }, [employees]);

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar este serviço?")) return;
    await deleteMut.mutateAsync({ id });
    utils.services.list.invalidate();
    utils.services.stats.invalidate();
    toast.success("Serviço eliminado");
  };

  const formatCents = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-muted-foreground">Monitorização de serviços extra (lavagens, carregamentos, etc.)</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label>Mês:</Label>
              <Select value={String(month)} onValueChange={v => setMonth(parseInt(v))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m, i) => (
                    <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || 2026)} className="w-24" />
            <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" /> Novo Serviço</Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /><span className="text-xs text-muted-foreground">Total Serviços</span></div>
              <p className="text-xl font-bold mt-1">{stats.total}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2"><Euro className="w-4 h-4 text-green-500" /><span className="text-xs text-muted-foreground">Receita</span></div>
              <p className="text-xl font-bold mt-1 text-green-600">{formatCents(stats.revenue)}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-red-500" /><span className="text-xs text-muted-foreground">Custos</span></div>
              <p className="text-xl font-bold mt-1 text-red-600">{formatCents(stats.cost)}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2"><Euro className="w-4 h-4 text-blue-500" /><span className="text-xs text-muted-foreground">Lucro</span></div>
              <p className={`text-xl font-bold mt-1 ${stats.profit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCents(stats.profit)}</p>
            </Card>
          </div>
        )}

        {/* By Type */}
        {stats && Object.keys(stats.byType).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.byType).map(([type, data]: [string, any]) => {
              const cfg = SERVICE_TYPES[type] || SERVICE_TYPES.outro;
              const Icon = cfg.icon;
              return (
                <Card key={type} className="p-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                    <span className="text-xs text-muted-foreground">{cfg.label}</span>
                  </div>
                  <p className="text-lg font-bold mt-1">{data.count}</p>
                  <p className="text-xs text-muted-foreground">Receita: {formatCents(data.revenue)}</p>
                </Card>
              );
            })}
          </div>
        )}

        {/* Employee Ranking */}
        {stats && stats.byEmployee.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Ranking de Condutores</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.byEmployee.map((emp: any, idx: number) => (
                  <div key={emp.employeeId} className="flex items-center justify-between p-2 rounded bg-muted">
                    <div className="flex items-center gap-2">
                      <span className="font-bold w-6 text-center">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}</span>
                      <span className="text-sm font-medium">{emp.employeeName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{emp.count} serviços</span>
                      <Badge variant="secondary">{formatCents(emp.revenue)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {Object.entries(SERVICE_TYPES).map(([k, v]) => (
              <TabsTrigger key={k} value={k}>{v.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : services.length === 0 ? (
          <Card className="p-10 text-center">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Sem serviços registados neste período</p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Condutor</th>
                  <th className="p-2">Cliente</th>
                  <th className="p-2">Matrícula</th>
                  <th className="p-2 text-right">Receita</th>
                  <th className="p-2 text-right">Custo</th>
                  <th className="p-2 text-right">Comissão</th>
                  <th className="p-2">Data</th>
                  <th className="p-2 w-20">Ações</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s: any) => {
                  const cfg = SERVICE_TYPES[s.serviceType] || SERVICE_TYPES.outro;
                  const Icon = cfg.icon;
                  return (
                    <tr key={s.id} className="border-b hover:bg-muted/50">
                      <td className="p-2"><span className="flex items-center gap-1"><Icon className={`w-3 h-3 ${cfg.color}`} />{cfg.label}</span></td>
                      <td className="p-2">{s.employeeId ? (employeeMap.get(s.employeeId) || `#${s.employeeId}`) : "—"}</td>
                      <td className="p-2">{s.clientName || "—"}</td>
                      <td className="p-2">{s.vehiclePlate || "—"}</td>
                      <td className="p-2 text-right text-green-600">{formatCents(s.revenue || 0)}</td>
                      <td className="p-2 text-right text-red-600">{formatCents(s.cost || 0)}</td>
                      <td className="p-2 text-right">{formatCents(s.commission || 0)}</td>
                      <td className="p-2 text-xs">{new Date(s.serviceDate).toLocaleDateString("pt-PT")}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setEditService(s)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}>
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <ServiceDialog employees={employees} onClose={() => setShowCreate(false)} />}
      {editService && <ServiceDialog employees={employees} service={editService} onClose={() => setEditService(null)} />}
    </>
  );
}

function ServiceDialog({ employees, onClose, service }: { employees: any[]; onClose: () => void; service?: any }) {
  const isEdit = !!service;
  const [form, setForm] = useState({
    serviceType: service?.serviceType || "lavagem",
    employeeId: service?.employeeId ? String(service.employeeId) : "",
    clientName: service?.clientName || "",
    vehiclePlate: service?.vehiclePlate || "",
    revenue: service ? String((service.revenue || 0) / 100) : "",
    cost: service ? String((service.cost || 0) / 100) : "",
    commission: service ? String((service.commission || 0) / 100) : "",
    notes: service?.notes || "",
    serviceDate: service?.serviceDate
      ? new Date(service.serviceDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });
  const createMut = trpc.services.create.useMutation();
  const updateMut = trpc.services.update.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    try {
      const empId = form.employeeId && form.employeeId !== "none" ? parseInt(form.employeeId) : undefined;
      if (isEdit) {
        await updateMut.mutateAsync({
          id: service.id,
          revenue: form.revenue ? Math.round(parseFloat(form.revenue) * 100) : undefined,
          cost: form.cost ? Math.round(parseFloat(form.cost) * 100) : undefined,
          commission: form.commission ? Math.round(parseFloat(form.commission) * 100) : undefined,
          notes: form.notes || undefined,
        });
        toast.success("Serviço atualizado");
      } else {
        await createMut.mutateAsync({
          serviceType: form.serviceType as any,
          employeeId: empId,
          clientName: form.clientName || undefined,
          vehiclePlate: form.vehiclePlate || undefined,
          revenue: form.revenue ? Math.round(parseFloat(form.revenue) * 100) : undefined,
          cost: form.cost ? Math.round(parseFloat(form.cost) * 100) : undefined,
          commission: form.commission ? Math.round(parseFloat(form.commission) * 100) : undefined,
          notes: form.notes || undefined,
          serviceDate: form.serviceDate,
        });
        toast.success("Serviço registado");
      }
      utils.services.list.invalidate();
      utils.services.stats.invalidate();
      onClose();
    } catch (e: any) { toast.error(e.message || "Erro"); }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{isEdit ? "Editar Serviço" : "Novo Serviço"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.serviceType} onValueChange={(v: any) => setForm(f => ({ ...f, serviceType: v }))} disabled={isEdit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Condutor</Label>
              <Select value={form.employeeId || "none"} onValueChange={v => setForm(f => ({ ...f, employeeId: v === "none" ? "" : v }))} disabled={isEdit}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {employees.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isEdit && (
              <>
                <div>
                  <Label>Cliente</Label>
                  <Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
                </div>
                <div>
                  <Label>Matrícula</Label>
                  <Input value={form.vehiclePlate} onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value.toUpperCase() }))} placeholder="AA-00-BB" />
                </div>
              </>
            )}
            <div>
              <Label>Receita (€)</Label>
              <Input type="number" step="0.01" value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))} />
            </div>
            <div>
              <Label>Custo (€)</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
            </div>
            <div>
              <Label>Comissão (€)</Label>
              <Input type="number" step="0.01" value={form.commission} onChange={e => setForm(f => ({ ...f, commission: e.target.value }))} />
            </div>
            {!isEdit && (
              <div>
                <Label>Data</Label>
                <Input type="date" value={form.serviceDate} onChange={e => setForm(f => ({ ...f, serviceDate: e.target.value }))} />
              </div>
            )}
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending}>{isPending ? "A guardar..." : isEdit ? "Guardar" : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
