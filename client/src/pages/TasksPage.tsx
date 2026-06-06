import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  ListTodo, Plus, Clock, AlertTriangle, CheckCircle2, Circle,
  ArrowUpCircle, Pencil, Trash2, CalendarDays, Users, LayoutGrid, List, GripVertical, Bell,
} from "lucide-react";

const COLUMNS = [
  { id: "backlog", label: "Backlog", icon: Circle, color: "border-t-slate-400", bg: "bg-slate-50" },
  { id: "todo", label: "A Fazer", icon: ListTodo, color: "border-t-blue-500", bg: "bg-blue-50" },
  { id: "in_progress", label: "Em Curso", icon: Clock, color: "border-t-amber-500", bg: "bg-amber-50" },
  { id: "review", label: "Revisão", icon: ArrowUpCircle, color: "border-t-purple-500", bg: "bg-purple-50" },
  { id: "done", label: "Concluído", icon: CheckCircle2, color: "border-t-emerald-500", bg: "bg-emerald-50" },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-700", medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700", urgent: "bg-red-100 text-red-700",
};
const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente",
};
const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog", todo: "A Fazer", in_progress: "Em Curso", review: "Revisão", done: "Concluído",
};

type TaskRaw = {
  id: number; title: string; description: string | null; projectId: number | null;
  assigneeId: number | null; createdById: number;
  taskStatus?: string; taskPriority?: string; status?: string; priority?: string;
  dueDate: Date | string | null; completedAt: Date | string | null;
  createdAt: Date | string; updatedAt: Date | string;
};
type Task = {
  id: number; title: string; description: string | null; projectId: number | null;
  assigneeId: number | null; createdById: number; status: string; priority: string;
  dueDate: Date | string | null; completedAt: Date | string | null;
  createdAt: Date | string; updatedAt: Date | string;
};
function normalizeTask(t: TaskRaw): Task {
  return { ...t, status: t.taskStatus ?? t.status ?? "todo", priority: t.taskPriority ?? t.priority ?? "medium" } as Task;
}

export default function TasksPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: allTasks = [], isLoading } = trpc.tasks.list.useQuery();
  const { data: stats } = trpc.tasks.stats.useQuery();
  const { data: projects = [] } = trpc.projects.list.useQuery();
  const { data: employees = [] } = trpc.rh.list.useQuery();
  const { data: usersList = [] } = trpc.users.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filterProject, setFilterProject] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [form, setForm] = useState({
    title: "", description: "", projectId: "", assigneeIds: [] as number[], priority: "medium", dueDate: "",
  });

  // Drag & Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const createMut = trpc.tasks.create.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); utils.tasks.stats.invalidate(); setShowCreate(false); resetForm(); toast.success("Tarefa criada!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.tasks.update.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); utils.tasks.stats.invalidate(); setEditTask(null); toast.success("Tarefa atualizada!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.tasks.delete.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); utils.tasks.stats.invalidate(); toast.success("Tarefa eliminada!"); },
    onError: (e) => toast.error(e.message),
  });
  const moveMut = trpc.tasks.update.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); utils.tasks.stats.invalidate(); },
  });
  const checkNotifMut = trpc.tasks.checkNotifications.useMutation({
    onSuccess: (data) => {
      if (data.notified > 0) {
        toast.success(`${data.notified} notificação(ões) enviada(s)`);
      } else {
        toast.info("Nenhuma notificação pendente");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ title: "", description: "", projectId: "", assigneeIds: [], priority: "medium", dueDate: "" });
  }

  function openEdit(t: Task | TaskRaw) {
    const normalized = "taskStatus" in t ? normalizeTask(t as TaskRaw) : t as Task;
    setEditTask(normalized);
    setForm({
      title: normalized.title,
      description: normalized.description ?? "",
      projectId: normalized.projectId?.toString() ?? "",
      assigneeIds: normalized.assigneeId ? [normalized.assigneeId] : [],
      priority: normalized.priority,
      dueDate: normalized.dueDate ? new Date(normalized.dueDate).toISOString().split("T")[0] : "",
    });
    // Load assignees for this task
    utils.tasks.getAssignees.fetch({ taskId: t.id }).then((assignees) => {
      if (assignees && assignees.length > 0) {
        setForm(f => ({ ...f, assigneeIds: assignees.map((a: any) => a.employeeId) }));
      }
    }).catch(() => {});
  }

  function toggleAssignee(empId: number) {
    setForm(f => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(empId)
        ? f.assigneeIds.filter(id => id !== empId)
        : [...f.assigneeIds, empId],
    }));
  }

  const filteredTasks = useMemo(() => {
    let t = (allTasks as unknown as TaskRaw[]).map(normalizeTask);
    if (filterProject !== "all") t = t.filter(x => x.projectId === parseInt(filterProject));
    return t;
  }, [allTasks, filterProject]);

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = {};
    COLUMNS.forEach(c => { map[c.id] = []; });
    filteredTasks.forEach(t => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [filteredTasks]);

  function isOverdue(t: Task) {
    return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done";
  }

  function getAssigneeName(assigneeId: number | null) {
    if (!assigneeId) return null;
    const empRow = (employees as any[]).find(e => (e.employee ?? e).id === assigneeId);
    const emp = empRow ? (empRow.employee ?? empRow) : null;
    return emp?.fullName ?? null;
  }

  function getProjectName(projectId: number | null) {
    if (!projectId) return null;
    const p = (projects as any[]).find(p => p.id === projectId);
    return p?.name ?? null;
  }

  // ─── DRAG & DROP HANDLERS ─────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, taskId: number) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(taskId));
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDragOverCol(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverCol(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = parseInt(e.dataTransfer.getData("text/plain"));
    if (isNaN(taskId)) return;
    const task = (allTasks as unknown as TaskRaw[]).map(normalizeTask).find(t => t.id === taskId);
    if (!task || task.status === colId) return;
    moveMut.mutate({ id: taskId, status: colId as any });
    toast.success(`Tarefa movida para ${STATUS_LABELS[colId]}`);
  }, [allTasks, moveMut]);

  // ─── ASSIGNEE DISPLAY ────────────────────────────────────────────────────
  function AssigneeBadges({ task }: { task: Task }) {
    const assigneeName = getAssigneeName(task.assigneeId);
    // For now show the primary assignee; multi-assignees shown in detail
    if (!assigneeName) return null;
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />{assigneeName}
      </span>
    );
  }

  // ─── MULTI-ASSIGNEE PICKER ───────────────────────────────────────────────
  function AssigneePicker() {
    return (
      <div>
        <Label className="mb-2 block">Responsáveis</Label>
        <div className="border rounded-lg max-h-40 overflow-y-auto p-2 space-y-1">
          {(employees as any[]).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Nenhum funcionário registado</p>
          )}
          {(employees as any[]).map((e: any) => {
            const emp = e.employee ?? e;
            const checked = form.assigneeIds.includes(emp.id);
            return (
              <label key={emp.id} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleAssignee(emp.id)}
                />
                <span className="text-sm">{emp.fullName}</span>
              </label>
            );
          })}
        </div>
        {form.assigneeIds.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{form.assigneeIds.length} selecionado(s)</p>
        )}
      </div>
    );
  }

  // ─── TASK CARD (Kanban) ───────────────────────────────────────────────────
  function TaskCard({ task }: { task: Task }) {
    const projectName = getProjectName(task.projectId);
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        onDragEnd={handleDragEnd}
        className={`bg-white rounded-lg border shadow-sm p-3 space-y-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
          draggedTaskId === task.id ? "opacity-50 ring-2 ring-primary" : ""
        } ${isOverdue(task) ? "ring-2 ring-red-300" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            <p className="text-sm font-medium leading-tight truncate">{task.title}</p>
          </div>
          <div className="flex gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(task)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => { if (confirm("Eliminar tarefa?")) deleteMut.mutate({ id: task.id }); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          {projectName && <Badge variant="outline" className="text-xs">{projectName}</Badge>}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <AssigneeBadges task={task} />
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue(task) ? "text-red-600 font-medium" : ""}`}>
              <CalendarDays className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString("pt-PT")}
              {isOverdue(task) && <AlertTriangle className="h-3 w-3" />}
            </span>
          )}
        </div>
      </div>
    );
  }

  const isAdmin = user && ["super_admin", "admin"].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Quadro Kanban de tarefas</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* View toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-9"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-9"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filtrar por projeto..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Projetos</SelectItem>
              {(projects as any[]).map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => checkNotifMut.mutate()} disabled={checkNotifMut.isPending}>
              <Bell className="h-4 w-4 mr-1" />
              {checkNotifMut.isPending ? "A verificar..." : "Verificar Notificações"}
            </Button>
          )}
          <Button onClick={() => { resetForm(); setShowCreate(true); }}><Plus className="h-4 w-4 mr-2" /> Nova Tarefa</Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
          {[
            { label: "Total", value: stats.total, color: "text-slate-600" },
            { label: "Backlog", value: stats.backlog, color: "text-slate-500" },
            { label: "A Fazer", value: stats.todo, color: "text-blue-600" },
            { label: "Em Curso", value: stats.inProgress, color: "text-amber-600" },
            { label: "Revisão", value: stats.review, color: "text-purple-600" },
            { label: "Concluído", value: stats.done, color: "text-emerald-600" },
            { label: "Atrasadas", value: stats.overdue, color: "text-red-600" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="py-2 px-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Kanban Board */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {COLUMNS.map(col => (
            <div
              key={col.id}
              className={`rounded-lg border-t-4 ${col.color} min-h-[300px] transition-colors ${
                dragOverCol === col.id ? "bg-primary/10 ring-2 ring-primary/30" : "bg-muted/30"
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <col.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{col.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{grouped[col.id]?.length ?? 0}</Badge>
              </div>
              <div className="px-2 pb-2 space-y-2">
                {(grouped[col.id] ?? []).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {(grouped[col.id]?.length ?? 0) === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">Sem tarefas</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ListTodo className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Sem tarefas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Responsáveis</TableHead>
                      <TableHead>Data Limite</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map(task => {
                      const projectName = getProjectName(task.projectId);
                      const assigneeName = getAssigneeName(task.assigneeId);
                      const col = COLUMNS.find(c => c.id === task.status);
                      return (
                        <TableRow key={task.id} className={`group ${isOverdue(task) ? "bg-red-50" : ""}`}>
                          <TableCell>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-[250px]">{task.description}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${col?.bg ?? ""}`}>
                              {col?.label ?? task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                              {PRIORITY_LABELS[task.priority]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{projectName ?? "—"}</TableCell>
                          <TableCell className="text-sm">{assigneeName ?? "—"}</TableCell>
                          <TableCell className="text-sm">
                            {task.dueDate ? (
                              <span className={isOverdue(task) ? "text-red-600 font-medium" : ""}>
                                {new Date(task.dueDate).toLocaleDateString("pt-PT")}
                                {isOverdue(task) && <AlertTriangle className="h-3 w-3 inline ml-1" />}
                              </span>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Select
                                value={task.status}
                                onValueChange={(v) => moveMut.mutate({ id: task.id, status: v as any })}
                              >
                                <SelectTrigger className="h-7 w-28 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {COLUMNS.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(task)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Eliminar?")) deleteMut.mutate({ id: task.id }); }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título da tarefa..." />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Projeto</Label>
                <Select value={form.projectId} onValueChange={v => setForm(f => ({ ...f, projectId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
                  <SelectContent>
                    {(projects as any[]).map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Data Limite</Label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <AssigneePicker />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button disabled={!form.title || createMut.isPending} onClick={() => createMut.mutate({
              title: form.title,
              description: form.description || undefined,
              projectId: form.projectId ? parseInt(form.projectId) : undefined,
              assigneeId: form.assigneeIds[0] ?? undefined,
              assigneeIds: form.assigneeIds.length > 0 ? form.assigneeIds : undefined,
              priority: form.priority as any,
              dueDate: form.dueDate || undefined,
            })}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTask} onOpenChange={() => setEditTask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Tarefa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Projeto</Label>
                <Select value={form.projectId} onValueChange={v => setForm(f => ({ ...f, projectId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
                  <SelectContent>
                    {(projects as any[]).map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Limite</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={editTask?.status ?? "todo"} onValueChange={v => setEditTask(prev => prev ? { ...prev, status: v } : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AssigneePicker />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTask(null)}>Cancelar</Button>
            <Button disabled={!form.title || updateMut.isPending} onClick={() => editTask && updateMut.mutate({
              id: editTask.id,
              title: form.title,
              description: form.description || undefined,
              projectId: form.projectId ? parseInt(form.projectId) : null,
              assigneeId: form.assigneeIds[0] ?? null,
              assigneeIds: form.assigneeIds,
              priority: form.priority as any,
              status: editTask.status as any,
              dueDate: form.dueDate || null,
            })}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
