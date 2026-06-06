import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
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
  AlertTriangle, Plus, Clock, User, Car, Eye, Trash2, Pencil,
  BarChart3, AlertCircle, CheckCircle2, XCircle, ShieldAlert,
  TrendingDown, Activity, Mail, Loader2, Bot, MapPin
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: "Aberta", color: "bg-red-100 text-red-800" },
  investigating: { label: "Em Investigação", color: "bg-yellow-100 text-yellow-800" },
  resolved: { label: "Resolvida", color: "bg-green-100 text-green-800" },
  dismissed: { label: "Descartada", color: "bg-gray-100 text-gray-800" },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Baixa", color: "bg-slate-100 text-slate-700" },
  medium: { label: "Média", color: "bg-blue-100 text-blue-700" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-700" },
  critical: { label: "Crítica", color: "bg-red-100 text-red-700" },
};

const TYPE_CONFIG: Record<string, string> = {
  vidro_aberto: "Vidro Aberto",
  mal_estacionado: "Mal Estacionado",
  dano: "Dano",
  chave_errada: "Chave Errada",
  combustivel: "Combustível",
  limpeza: "Limpeza",
  documentos: "Documentos",
  outro: "Outro",
};

export default function IncidentsPage() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editInc, setEditInc] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const queryInput = useMemo(() => {
    const input: any = {};
    if (filterStatus !== "all") input.status = filterStatus;
    if (filterSeverity !== "all") input.severity = filterSeverity;
    return Object.keys(input).length > 0 ? input : undefined;
  }, [filterStatus, filterSeverity]);

  const { data: incidents = [], isLoading } = trpc.incidents.list.useQuery(queryInput);
  const { data: stats } = trpc.incidents.stats.useQuery(undefined);
  const updateMut = trpc.incidents.update.useMutation();
  const deleteMut = trpc.incidents.delete.useMutation();
  const utils = trpc.useUtils();
  const { data: employees = [] } = trpc.rh.list.useQuery();

  const employeeMap = useMemo(() => {
    const map = new Map<number, string>();
    employees.forEach((row: any) => {
      const emp = row.employee ?? row;
      if (emp?.id != null) map.set(emp.id, emp.fullName);
    });
    return map;
  }, [employees]);

  const is48hOverdue = (createdAt: string, status: string) => {
    if (status === "resolved" || status === "dismissed") return false;
    const created = new Date(createdAt);
    const now = new Date();
    return (now.getTime() - created.getTime()) > 48 * 60 * 60 * 1000;
  };

  const handleResolve = async (id: number, resolution: string) => {
    await updateMut.mutateAsync({ id, status: "resolved", resolution });
    utils.incidents.list.invalidate();
    utils.incidents.stats.invalidate();
    toast.success("Ocorrência resolvida");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar esta ocorrência?")) return;
    await deleteMut.mutateAsync({ id });
    utils.incidents.list.invalidate();
    utils.incidents.stats.invalidate();
    toast.success("Ocorrência eliminada");
  };

  const syncGmail = trpc.reviews.syncFromGmail.useMutation({
    onSuccess: (data: any) => {
      utils.incidents.list.invalidate();
      utils.incidents.stats.invalidate();
      if (data.message) {
        toast.info(data.message);
      } else {
        toast.success(`Sync concluído: ${data.incidentsImported} ocorrências importadas, ${data.incidentsSkipped} ignoradas`);
      }
    },
    onError: (err) => toast.error("Erro no sync: " + err.message),
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-muted-foreground">Gestão e análise de ocorrências reportadas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => syncGmail.mutate()} disabled={syncGmail.isPending}>
              {syncGmail.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              {syncGmail.isPending ? "A sincronizar..." : "Sincronizar Gmail"}
            </Button>
            <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" /> Nova Ocorrência</Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /><span className="text-xs text-muted-foreground">Total</span></div>
              <p className="text-xl font-bold mt-1">{stats.total}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-600" /><span className="text-xs text-muted-foreground">Abertas</span></div>
              <p className="text-xl font-bold mt-1 text-red-600">{stats.open}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-xs text-muted-foreground">Resolvidas</span></div>
              <p className="text-xl font-bold mt-1 text-green-600">{stats.resolved}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-600" /><span className="text-xs text-muted-foreground">Críticas</span></div>
              <p className="text-xl font-bold mt-1 text-red-600">{stats.critical}</p>
            </Card>
          </div>
        )}

        {/* By Type Chart */}
        {stats && Object.keys(stats.byType).length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Por Tipo de Ocorrência</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats.byType).sort(([,a],[,b]) => (b as number) - (a as number)).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-2 rounded bg-muted">
                    <span className="text-sm">{TYPE_CONFIG[type] || type}</span>
                    <Badge variant="secondary">{count as number}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Label>Estado:</Label>
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
          <div className="flex items-center gap-2">
            <Label>Gravidade:</Label>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : incidents.length === 0 ? (
          <Card className="p-10 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Sem ocorrências registadas</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {incidents.map((inc: any) => {
              const overdue = is48hOverdue(inc.createdAt, inc.status);
              return (
                <Card key={inc.id} className={`${overdue ? "border-red-400 border-2" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{TYPE_CONFIG[inc.incidentType] || inc.incidentType}</span>
                          <Badge className={STATUS_CONFIG[inc.status]?.color}>{STATUS_CONFIG[inc.status]?.label}</Badge>
                          <Badge className={SEVERITY_CONFIG[inc.severity]?.color}>{SEVERITY_CONFIG[inc.severity]?.label}</Badge>
                          {overdue && <Badge className="bg-red-500 text-white">+48h sem resolução</Badge>}
                          {(inc as any).sourceEmailId && <Badge variant="outline" className="text-xs"><Bot className="w-3 h-3 mr-1" />Gmail</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{inc.description}</p>
                        {(inc as any).aiClassification && (
                          <p className="text-xs text-blue-600 flex items-center gap-1"><Bot className="w-3 h-3" /> IA: {(inc as any).aiClassification}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {inc.vehiclePlate && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {inc.vehiclePlate}</span>}
                          {inc.employeeId && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {employeeMap.get(inc.employeeId) || `#${inc.employeeId}`}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(inc.createdAt).toLocaleString("pt-PT")}</span>
                          {(inc as any).gpsLatitude && (inc as any).gpsLongitude && (
                            <a href={`https://www.google.com/maps?q=${(inc as any).gpsLatitude},${(inc as any).gpsLongitude}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-blue-500 hover:underline">
                              <MapPin className="w-3 h-3" /> Ver no mapa
                            </a>
                          )}
                        </div>
                        {inc.resolution && <p className="text-xs text-green-700 mt-1">Resolução: {inc.resolution}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditInc(inc)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {(inc.status === "open" || inc.status === "investigating") && (
                          <Button size="sm" variant="outline" onClick={() => setSelectedId(inc.id)}>
                            Resolver
                          </Button>
                        )}
                        {user?.role === "super_admin" && (
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(inc.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && <CreateIncidentDialog employees={employees} onClose={() => setShowCreate(false)} />}
      {selectedId && <ResolveDialog id={selectedId} onResolve={handleResolve} onClose={() => setSelectedId(null)} />}
      {editInc && <EditIncidentDialog incident={editInc} employees={employees} onClose={() => setEditInc(null)} />}
    </>
  );
}

function ResolveDialog({ id, onResolve, onClose }: { id: number; onResolve: (id: number, resolution: string) => void; onClose: () => void }) {
  const [resolution, setResolution] = useState("");
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Resolver Ocorrência #{id}</DialogTitle></DialogHeader>
        <div>
          <Label>Resolução</Label>
          <Textarea value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Descrever como foi resolvida..." rows={3} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { onResolve(id, resolution); onClose(); }} disabled={!resolution.trim()}>Resolver</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateIncidentDialog({ employees, onClose }: { employees: any[]; onClose: () => void }) {
  const [form, setForm] = useState({
    vehiclePlate: "",
    employeeId: "",
    incidentType: "outro" as const,
    severity: "medium" as const,
    description: "",
  });
  const createMut = trpc.incidents.create.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    if (!form.description.trim()) { toast.error("Descrição obrigatória"); return; }
    try {
      await createMut.mutateAsync({
        vehiclePlate: form.vehiclePlate || undefined,
        employeeId: form.employeeId && form.employeeId !== "none" ? parseInt(form.employeeId) : undefined,
        incidentType: form.incidentType,
        severity: form.severity,
        description: form.description,
      });
      utils.incidents.list.invalidate();
      utils.incidents.stats.invalidate();
      toast.success("Ocorrência criada");
      onClose();
    } catch (e: any) { toast.error(e.message || "Erro"); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nova Ocorrência</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.incidentType} onValueChange={(v: any) => setForm(f => ({ ...f, incidentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Gravidade</Label>
              <Select value={form.severity} onValueChange={(v: any) => setForm(f => ({ ...f, severity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Matrícula</Label>
              <Input value={form.vehiclePlate} onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value.toUpperCase() }))} placeholder="AA-00-BB" />
            </div>
            <div>
              <Label>Condutor Responsável</Label>
              <Select value={form.employeeId} onValueChange={v => setForm(f => ({ ...f, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {employees.map((row: any) => {
                    const e = row.employee ?? row;
                    return <SelectItem key={e.id} value={String(e.id)}>{e.fullName}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Descrição *</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrever a ocorrência..." rows={3} />
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

function EditIncidentDialog({ incident, employees, onClose }: { incident: any; employees: any[]; onClose: () => void }) {
  const [form, setForm] = useState({
    incidentType: incident.incidentType || "outro",
    severity: incident.severity || "medium",
    description: incident.description || "",
    vehiclePlate: incident.vehiclePlate || "",
    employeeId: incident.employeeId ? String(incident.employeeId) : "",
    status: incident.status || "open",
  });
  const updateMut = trpc.incidents.update.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    try {
      await updateMut.mutateAsync({
        id: incident.id,
        incidentType: form.incidentType as any,
        severity: form.severity as any,
        description: form.description || undefined,
        vehiclePlate: form.vehiclePlate || undefined,
        employeeId: form.employeeId && form.employeeId !== "none" ? parseInt(form.employeeId) : undefined,
        status: form.status as any,
      });
      utils.incidents.list.invalidate();
      utils.incidents.stats.invalidate();
      toast.success("Ocorrência atualizada");
      onClose();
    } catch (e: any) { toast.error(e.message || "Erro ao atualizar"); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Editar Ocorrência #{incident.id}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.incidentType} onValueChange={(v: any) => setForm(f => ({ ...f, incidentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Gravidade</Label>
              <Select value={form.severity} onValueChange={(v: any) => setForm(f => ({ ...f, severity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Matrícula</Label>
              <Input value={form.vehiclePlate} onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value.toUpperCase() }))} placeholder="AA-00-BB" />
            </div>
            <div className="col-span-2">
              <Label>Condutor Responsável</Label>
              <Select value={form.employeeId} onValueChange={v => setForm(f => ({ ...f, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {employees.map((row: any) => {
                    const e = row.employee ?? row;
                    return <SelectItem key={e.id} value={String(e.id)}>{e.fullName}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
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
