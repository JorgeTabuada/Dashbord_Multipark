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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useMemo, useRef } from "react";
import {
  Search, Plus, MessageSquare, Camera, Clock, User, Car,
  ChevronRight, ChevronLeft, Send, Eye, Trash2, Upload, Pencil,
  BarChart3, AlertCircle, CheckCircle2, Hourglass, XCircle,
  Package, DollarSign, Smartphone, Shirt, FileText, Glasses,
  HelpCircle, TrendingUp, Users, ShieldAlert
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "Novo", color: "bg-blue-100 text-blue-800 border-blue-200", icon: AlertCircle },
  investigating: { label: "Em Investigação", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Hourglass },
  found: { label: "Encontrado", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
  returned: { label: "Devolvido", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  closed: { label: "Fechado", color: "bg-gray-100 text-gray-800 border-gray-200", icon: XCircle },
};

const TYPE_CONFIG: Record<string, { label: string; icon: any }> = {
  money: { label: "Dinheiro", icon: DollarSign },
  electronics: { label: "Eletrónica", icon: Smartphone },
  clothing: { label: "Roupa", icon: Shirt },
  documents: { label: "Documentos", icon: FileText },
  accessories: { label: "Acessórios", icon: Glasses },
  other: { label: "Outro", icon: HelpCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Baixa", color: "bg-slate-100 text-slate-700" },
  medium: { label: "Média", color: "bg-blue-100 text-blue-700" },
  high: { label: "Alta", color: "bg-red-100 text-red-700" },
};

const KANBAN_COLUMNS = ["new", "investigating", "found", "returned", "closed"] as const;

export default function LostFoundPage() {
  const { user } = useAuth();
  const [view, setView] = useState<"kanban" | "detail" | "ranking" | "history">("kanban");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      {view === "kanban" ? (
        <KanbanView
          user={user}
          filterType={filterType}
          setFilterType={setFilterType}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSelect={(id: number) => { setSelectedId(id); setView("detail"); }}
          onNew={() => setShowCreate(true)}
          onShowRanking={() => setView("ranking")}
          onShowHistory={() => setView("history")}
        />
      ) : view === "ranking" ? (
        <DriverRankingView onBack={() => setView("kanban")} />
      ) : view === "history" ? (
        <BookingHistoryView onBack={() => setView("kanban")} />
      ) : selectedId ? (
        <DetailView
          id={selectedId}
          user={user}
          onBack={() => { setView("kanban"); setSelectedId(null); }}
        />
      ) : null}
      {showCreate && <CreateDialog user={user} onClose={() => setShowCreate(false)} />}
    </>
  );
}

// ─── KANBAN VIEW ──────────────────────────────────────────────────────────────

function KanbanView({ user, filterType, setFilterType, searchTerm, setSearchTerm, onSelect, onNew, onShowRanking, onShowHistory }: any) {
  const globalFilters = useGlobalFilters();
  const queryInput = useMemo(() => {
    const input: any = {};
    if (filterType !== "all") input.itemType = filterType;
    if (searchTerm.trim()) input.search = searchTerm.trim();
    if (globalFilters.projectId !== undefined) input.projectId = globalFilters.projectId;
    return input;
  }, [filterType, searchTerm, globalFilters.projectId]);

  const { data: items = [], isLoading } = trpc.lostFound.list.useQuery(queryInput);
  const updateMut = trpc.lostFound.update.useMutation();
  const utils = trpc.useUtils();

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    KANBAN_COLUMNS.forEach(s => map[s] = []);
    items.forEach((c: any) => {
      if (map[c.status]) map[c.status].push(c);
    });
    return map;
  }, [items]);

  const stats = useMemo(() => {
    const s = { total: items.length, new: 0, investigating: 0, found: 0, returned: 0, closed: 0, highPriority: 0 };
    items.forEach((i: any) => {
      if (s[i.status as keyof typeof s] !== undefined) (s as any)[i.status]++;
      if (i.priority === "high") s.highPriority++;
    });
    return s;
  }, [items]);

  const moveCard = async (id: number, newStatus: string) => {
    try {
      await updateMut.mutateAsync({ id, status: newStatus });
      utils.lostFound.list.invalidate();
      toast.success("Estado atualizado");
    } catch { toast.error("Erro ao mover"); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-muted-foreground">Gestão de objetos perdidos e achados nos veículos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onShowHistory}>
            <Clock className="w-4 h-4 mr-2" /> Histórico Reservas
          </Button>
          <Button variant="outline" onClick={onShowRanking}>
            <ShieldAlert className="w-4 h-4 mr-2" /> Cruzamento de Dados
          </Button>
          <Button onClick={onNew}><Plus className="w-4 h-4 mr-2" /> Novo Registo</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total", value: stats.total, icon: BarChart3, color: "text-foreground" },
          { label: "Novos", value: stats.new, icon: AlertCircle, color: "text-blue-600" },
          { label: "Investigação", value: stats.investigating, icon: Hourglass, color: "text-yellow-600" },
          { label: "Encontrados", value: stats.found, icon: Search, color: "text-emerald-600" },
          { label: "Devolvidos", value: stats.returned, icon: CheckCircle2, color: "text-green-600" },
          { label: "Fechados", value: stats.closed, icon: XCircle, color: "text-gray-600" },
          { label: "Alta Prioridade", value: stats.highPriority, icon: AlertCircle, color: "text-red-600" },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center gap-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Label>Tipo:</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, descrição, matrícula..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {KANBAN_COLUMNS.map(status => {
            const cfg = STATUS_CONFIG[status];
            const colItems = grouped[status] || [];
            return (
              <div key={status} className="space-y-3">
                <div className={`flex items-center gap-2 p-2 rounded-lg ${cfg.color} border`}>
                  <cfg.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{cfg.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">{colItems.length}</Badge>
                </div>
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-2 pr-2">
                    {colItems.map((item: any) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onSelect={() => onSelect(item.id)}
                        onMove={moveCard}
                        currentStatus={status}
                      />
                    ))}
                    {colItems.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">Sem registos</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onSelect, onMove, currentStatus }: any) {
  const colIdx = KANBAN_COLUMNS.indexOf(currentStatus);
  const canMoveLeft = colIdx > 0;
  const canMoveRight = colIdx < KANBAN_COLUMNS.length - 1;
  const TypeIcon = TYPE_CONFIG[item.itemType]?.icon || Package;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5" onClick={onSelect}>
            <TypeIcon className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-sm line-clamp-1">{item.description}</span>
          </div>
          <Badge className={`text-[10px] ${PRIORITY_CONFIG[item.priority]?.color}`}>
            {PRIORITY_CONFIG[item.priority]?.label}
          </Badge>
        </div>

        {item.vehiclePlate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Car className="w-3 h-3" /> {item.vehiclePlate}
          </div>
        )}

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="w-3 h-3" /> {item.clientName}
        </div>

        {item.estimatedValue && (
          <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <DollarSign className="w-3 h-3" /> ~{item.estimatedValue}€
          </div>
        )}

        <div className="text-[10px] text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString("pt-PT")}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted-foreground">#{item.id}</span>
          <div className="flex gap-1">
            {canMoveLeft && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onMove(item.id, KANBAN_COLUMNS[colIdx - 1]); }}>
                <ChevronLeft className="w-3 h-3" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onSelect}>
              <Eye className="w-3 h-3" />
            </Button>
            {canMoveRight && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onMove(item.id, KANBAN_COLUMNS[colIdx + 1]); }}>
                <ChevronRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── DETAIL VIEW ──────────────────────────────────────────────────────────────

function DetailView({ id, user, onBack }: { id: number; user: any; onBack: () => void }) {
  const { data: item, isLoading } = trpc.lostFound.getById.useQuery({ id });
  const { data: photos = [] } = trpc.lostFound.getPhotos.useQuery({ itemId: id });
  const { data: messages = [] } = trpc.lostFound.getMessages.useQuery({ itemId: id });
  const { data: vehicleDrivers = [] } = trpc.lostFound.vehicleDrivers.useQuery(
    { plate: item?.vehiclePlate || "" },
    { enabled: !!item?.vehiclePlate }
  );
  const { data: apiTimeline, isLoading: timelineLoading } = trpc.lostFound.bookingTimeline.useQuery(
    { bookingId: item?.bookingRef || "" },
    { enabled: !!item?.bookingRef }
  );
  const timelineHist = useMemo(() => {
    return (apiTimeline?.history || []).map((h: any) => ({
      id: h.id,
      changeType: h.changeType,
      actionDate: h.actionTime,
      userName: h.user?.firstName || h.agentName,
      userLastName: h.user?.lastName || "",
      parkName: h.booking?.parkName || "",
      remarks: h.remarks || h.modifiedFields || "",
    })).sort((a: any, b: any) => new Date(b.actionDate || 0).getTime() - new Date(a.actionDate || 0).getTime());
  }, [apiTimeline]);
  const updateMut = trpc.lostFound.update.useMutation();
  const uploadPhotoMut = trpc.lostFound.uploadPhoto.useMutation();
  const addMsgMut = trpc.lostFound.addMessage.useMutation();
  const deleteMut = trpc.lostFound.delete.useMutation();
  const utils = trpc.useUtils();

  const [newMsg, setNewMsg] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  if (isLoading || !item) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const TypeIcon = TYPE_CONFIG[item.itemType]?.icon || Package;

  const startEditing = () => {
    setEditForm({
      clientName: item.clientName || "",
      clientEmail: item.clientEmail || "",
      clientPhone: item.clientPhone || "",
      bookingRef: item.bookingRef || "",
      vehiclePlate: item.vehiclePlate || "",
      itemType: item.itemType || "other",
      description: item.description || "",
      estimatedValue: item.estimatedValue || 0,
      priority: item.priority || "medium",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateMut.mutateAsync({
        id,
        clientName: editForm.clientName || undefined,
        clientEmail: editForm.clientEmail || undefined,
        clientPhone: editForm.clientPhone || undefined,
        bookingRef: editForm.bookingRef || undefined,
        vehiclePlate: editForm.vehiclePlate || undefined,
        itemType: editForm.itemType || undefined,
        description: editForm.description || undefined,
        estimatedValue: editForm.estimatedValue ? Number(editForm.estimatedValue) : undefined,
        priority: editForm.priority || undefined,
      });
      utils.lostFound.getById.invalidate({ id });
      utils.lostFound.list.invalidate();
      setIsEditing(false);
      toast.success("Registo atualizado");
    } catch { toast.error("Erro ao atualizar"); }
  };

  const handleStatusChange = async (status: string) => {
    await updateMut.mutateAsync({ id, status });
    utils.lostFound.getById.invalidate({ id });
    utils.lostFound.list.invalidate();
    toast.success("Estado atualizado");
  };

  const handleSendMsg = async () => {
    if (!newMsg.trim()) return;
    await addMsgMut.mutateAsync({ itemId: id, message: newMsg, isInternal });
    setNewMsg("");
    utils.lostFound.getMessages.invalidate({ itemId: id });
    toast.success("Mensagem adicionada");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      await uploadPhotoMut.mutateAsync({ itemId: id, base64, filename: file.name });
      utils.lostFound.getPhotos.invalidate({ itemId: id });
      toast.success("Foto carregada");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDelete = async () => {
    if (!confirm("Tens a certeza que queres eliminar este registo?")) return;
    await deleteMut.mutateAsync({ id });
    utils.lostFound.list.invalidate();
    toast.success("Registo eliminado");
    onBack();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" /> Voltar</Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeIcon className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold">{item.description}</h1>
            <Badge className={STATUS_CONFIG[item.status]?.color}>{STATUS_CONFIG[item.status]?.label}</Badge>
            <Badge className={PRIORITY_CONFIG[item.priority]?.color}>{PRIORITY_CONFIG[item.priority]?.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Caso #{item.id} — Criado em {new Date(item.createdAt).toLocaleDateString("pt-PT")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={startEditing}><Pencil className="w-4 h-4 mr-1" /> Editar</Button>
        <Select value={item.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(user?.role === "super_admin" || user?.role === "admin") && (
          <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="w-4 h-4" /></Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="messages">Mensagens ({messages.length})</TabsTrigger>
              <TabsTrigger value="photos">Fotos ({photos.length})</TabsTrigger>
              {item.vehiclePlate && <TabsTrigger value="vehicle">Viatura</TabsTrigger>}
              {item.bookingRef && <TabsTrigger value="booking-history">Histórico ({timelineHist.length})</TabsTrigger>}
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Informação do Item</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <p className="font-medium flex items-center gap-1"><TypeIcon className="w-4 h-4" /> {TYPE_CONFIG[item.itemType]?.label}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor Estimado:</span>
                      <p className="font-medium">{item.estimatedValue ? `${item.estimatedValue}€` : "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Descrição:</span>
                      <p className="font-medium">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Dados do Cliente</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Nome:</span>
                      <p className="font-medium">{item.clientName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{item.clientEmail || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Telefone:</span>
                      <p className="font-medium">{item.clientPhone || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ref. Reserva:</span>
                      <p className="font-medium">{item.bookingRef || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {item.vehiclePlate && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Viatura Associada</CardTitle></CardHeader>
                  <CardContent className="text-sm">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium text-lg">{item.vehiclePlate}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {item.resolution && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Resolução</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm">{item.resolution}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <ScrollArea className="max-h-[50vh]">
                    <div className="space-y-3">
                      {messages.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">Sem mensagens</p>
                      )}
                      {messages.map((m: any) => (
                        <div key={m.id} className={`p-3 rounded-lg text-sm ${m.isInternal ? "bg-amber-50 border border-amber-200" : "bg-muted"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{m.userName}</span>
                            <div className="flex items-center gap-2">
                              {m.isInternal && <Badge variant="outline" className="text-[10px]">Interna</Badge>}
                              <span className="text-[10px] text-muted-foreground">{new Date(m.createdAt).toLocaleString("pt-PT")}</span>
                            </div>
                          </div>
                          <p>{m.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Separator />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escrever mensagem..."
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendMsg()}
                      className="flex-1"
                    />
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                      Interna
                    </label>
                    <Button size="sm" onClick={handleSendMsg} disabled={!newMsg.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      <Button variant="outline" asChild><span><Upload className="w-4 h-4 mr-2" /> Carregar Foto</span></Button>
                    </label>
                  </div>
                  {photos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sem fotos</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {photos.map((p: any) => (
                        <div key={p.id} className="relative group">
                          <img src={p.url} alt={p.caption || "Foto"} className="rounded-lg w-full h-32 object-cover" />
                          {p.caption && <p className="text-xs text-muted-foreground mt-1">{p.caption}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {item.vehiclePlate && (
              <TabsContent value="vehicle" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Car className="w-5 h-5" /> Histórico de Condutores — {item.vehiclePlate}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vehicleDrivers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem movimentos registados para esta viatura.</p>
                    ) : (
                      <div className="space-y-2">
                        {vehicleDrivers.slice(0, 20).map((d: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-muted">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Condutor #{d.employeeId}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {d.createdAt ? new Date(d.createdAt).toLocaleString("pt-PT") : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {item.bookingRef && (
              <TabsContent value="booking-history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-5 h-5" /> Histórico da Reserva — {item.bookingRef.slice(-12)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {timelineLoading ? (
                      <div className="flex justify-center py-6"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
                    ) : timelineHist.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem histórico encontrado na API para esta reserva.</p>
                    ) : (
                      <div className="relative pl-6 space-y-0">
                        {timelineHist.map((h: any, i: number) => {
                          const cfg = CHANGE_TYPE_CONFIG[h.changeType] || { label: h.changeType, color: "bg-gray-100 text-gray-800" };
                          return (
                            <div key={h.id} className="relative pb-4">
                              {i < timelineHist.length - 1 && (
                                <div className="absolute left-[-16px] top-3 bottom-0 w-px bg-border" />
                              )}
                              <div className="absolute left-[-20px] top-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={cfg.color}>{cfg.label}</Badge>
                                    <span className="font-medium text-sm">{h.userName ? `${h.userName} ${h.userLastName || ""}`.trim() : "Sistema"}</span>
                                  </div>
                                  {h.remarks && <p className="text-xs text-muted-foreground mt-1">{h.remarks}</p>}
                                  {h.parkName && <p className="text-xs text-muted-foreground">Parque: {h.parkName}</p>}
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {h.actionDate ? new Date(h.actionDate).toLocaleString("pt-PT") : "—"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right: Quick Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <Badge className={STATUS_CONFIG[item.status]?.color}>{STATUS_CONFIG[item.status]?.label}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prioridade</span>
                <Badge className={PRIORITY_CONFIG[item.priority]?.color}>{PRIORITY_CONFIG[item.priority]?.label}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span>{TYPE_CONFIG[item.itemType]?.label}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado</span>
                <span>{new Date(item.createdAt).toLocaleDateString("pt-PT")}</span>
              </div>
              {item.estimatedValue && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor</span>
                    <span className="font-medium text-amber-600">{item.estimatedValue}€</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Ações Rápidas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {item.status === "new" && (
                <Button className="w-full" size="sm" onClick={() => handleStatusChange("investigating")}>
                  Iniciar Investigação
                </Button>
              )}
              {item.status === "investigating" && (
                <Button className="w-full" size="sm" onClick={() => handleStatusChange("found")}>
                  Marcar como Encontrado
                </Button>
              )}
              {item.status === "found" && (
                <Button className="w-full" size="sm" onClick={() => handleStatusChange("returned")}>
                  Marcar como Devolvido
                </Button>
              )}
              {(item.status === "returned" || item.status === "found") && (
                <Button className="w-full" size="sm" variant="outline" onClick={() => handleStatusChange("closed")}>
                  Fechar Caso
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Perdido/Achado</DialogTitle></DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div><Label>Nome do Cliente</Label><Input value={editForm.clientName} onChange={e => setEditForm((f: any) => ({ ...f, clientName: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input value={editForm.clientEmail} onChange={e => setEditForm((f: any) => ({ ...f, clientEmail: e.target.value }))} /></div>
                <div><Label>Telefone</Label><Input value={editForm.clientPhone} onChange={e => setEditForm((f: any) => ({ ...f, clientPhone: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Ref. Reserva</Label><Input value={editForm.bookingRef} onChange={e => setEditForm((f: any) => ({ ...f, bookingRef: e.target.value }))} /></div>
                <div><Label>Matrícula</Label><Input value={editForm.vehiclePlate} onChange={e => setEditForm((f: any) => ({ ...f, vehiclePlate: e.target.value.toUpperCase() }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo de Item</Label>
                  <Select value={editForm.itemType} onValueChange={v => setEditForm((f: any) => ({ ...f, itemType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select value={editForm.priority} onValueChange={v => setEditForm((f: any) => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Valor Estimado (€)</Label><Input type="number" value={editForm.estimatedValue} onChange={e => setEditForm((f: any) => ({ ...f, estimatedValue: e.target.value }))} /></div>
              <div><Label>Descrição</Label><Textarea value={editForm.description} onChange={e => setEditForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={updateMut.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── DRIVER RANKING VIEW ──────────────────────────────────────────────────────

function DriverRankingView({ onBack }: { onBack: () => void }) {
  const { data: crossRef = [], isLoading } = trpc.lostFound.bookingHistoryCrossRef.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" /> Voltar</Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" /> Cruzamento de Dados
          </h1>
          <p className="text-muted-foreground">Condutores envolvidos em reservas com casos de perdidos/achados</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Ranking por Casos Associados
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Condutores ordenados pelo número de casos de perdidos/achados em que estiveram envolvidos
            (baseado no histórico de reservas importado).
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
          ) : crossRef.length === 0 ? (
            <div className="text-center py-10">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Sem dados suficientes para cruzamento.</p>
              <p className="text-xs text-muted-foreground mt-1">É necessário ter registos de perdidos/achados com referência de reserva e histórico importado do backoffice.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-left">
                    <th className="p-2 w-10">#</th>
                    <th className="p-2">Condutor</th>
                    <th className="p-2 text-right">Casos</th>
                    <th className="p-2 text-right">Check-ins</th>
                    <th className="p-2 text-right">Check-outs</th>
                    <th className="p-2 text-right">Movimentos</th>
                    <th className="p-2 text-right">Total Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {crossRef.map((r: any, i: number) => (
                    <tr key={r.userName} className={`border-t ${i === 0 ? "bg-red-50" : i < 3 ? "bg-amber-50" : "hover:bg-muted/30"}`}>
                      <td className="p-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-red-500 text-white" : i < 3 ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-700"}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="p-2 font-medium">{r.userName}</td>
                      <td className="p-2 text-right">
                        <Badge variant={r.caseCount > 2 ? "destructive" : "outline"}>{r.caseCount}</Badge>
                      </td>
                      <td className="p-2 text-right text-green-600">{r.checkins || 0}</td>
                      <td className="p-2 text-right text-violet-600">{r.checkouts || 0}</td>
                      <td className="p-2 text-right text-amber-600">{r.movements || 0}</td>
                      <td className="p-2 text-right font-medium">{r.totalActions || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── CREATE DIALOG ────────────────────────────────────────────────────────────

// ─── RESERVATION PREVIEW (auto-fetches timeline from API) ────────────────────

function LostFoundReservationPreview({ bookingId }: { bookingId: string }) {
  const { data, isLoading } = trpc.lostFound.bookingTimeline.useQuery(
    { bookingId },
    { enabled: bookingId.length >= 4 }
  );

  if (!bookingId || bookingId.length < 4) return null;
  if (isLoading) return <p className="text-xs text-muted-foreground mt-2 animate-pulse">A carregar histórico da API...</p>;

  const history = data?.history || [];
  if (history.length === 0) return <p className="text-xs text-amber-600 mt-2">Nenhum histórico encontrado para este ID.</p>;

  return (
    <div className="mt-2 max-h-40 overflow-y-auto space-y-1 border rounded p-2 bg-white dark:bg-gray-900">
      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{history.length} eventos encontrados</p>
      {history.slice(0, 10).map((h: any) => {
        const cfg = CHANGE_TYPE_CONFIG[h.changeType] || { label: h.changeType, color: "bg-gray-100 text-gray-800" };
        return (
          <div key={h.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted">
            <div className="flex items-center gap-1.5">
              <Badge className={`${cfg.color} text-[10px] px-1`}>{cfg.label}</Badge>
              <span>{h.user?.firstName || h.agentName || "Sistema"} {h.user?.lastName || ""}</span>
            </div>
            <span className="text-muted-foreground">{h.actionTime ? new Date(h.actionTime).toLocaleString("pt-PT") : "—"}</span>
          </div>
        );
      })}
      {history.length > 10 && <p className="text-xs text-muted-foreground">... e mais {history.length - 10} eventos</p>}
    </div>
  );
}

function CreateDialog({ user, onClose }: { user: any; onClose: () => void }) {
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    bookingRef: "",
    vehiclePlate: "",
    itemType: "other" as const,
    description: "",
    estimatedValue: "",
    priority: "medium" as const,
  });
  const createMut = trpc.lostFound.create.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    if (!form.clientName.trim() || !form.description.trim()) {
      toast.error("Nome do cliente e descrição são obrigatórios");
      return;
    }
    if (!form.bookingRef.trim()) {
      toast.error("ID da reserva é obrigatório");
      return;
    }
    try {
      await createMut.mutateAsync({
        clientName: form.clientName,
        clientEmail: form.clientEmail || undefined,
        clientPhone: form.clientPhone || undefined,
        bookingRef: form.bookingRef || undefined,
        vehiclePlate: form.vehiclePlate || undefined,
        itemType: form.itemType,
        description: form.description,
        estimatedValue: form.estimatedValue ? parseInt(form.estimatedValue) : undefined,
        priority: form.priority,
      });
      utils.lostFound.list.invalidate();
      toast.success("Registo criado com sucesso");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar registo");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" /> Novo Perdido/Achado
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nome do Cliente *</Label>
              <Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="Nome completo" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.clientPhone} onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))} placeholder="+351 ..." />
            </div>
            <div className="col-span-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200">
              <Label className="text-emerald-700 dark:text-emerald-300 font-medium">ID da Reserva (Multipark) *</Label>
              <p className="text-xs text-muted-foreground mb-1">O histórico completo é carregado automaticamente da API</p>
              <Input value={form.bookingRef} onChange={e => setForm(f => ({ ...f, bookingRef: e.target.value }))} placeholder="Ex: 6789abc..." className="font-mono" />
              <LostFoundReservationPreview bookingId={form.bookingRef} />
            </div>
            <div>
              <Label>Matrícula</Label>
              <Input value={form.vehiclePlate} onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value.toUpperCase() }))} placeholder="AA-00-BB" />
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo de Item *</Label>
              <Select value={form.itemType} onValueChange={(v: any) => setForm(f => ({ ...f, itemType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={(v: any) => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor Estimado (€)</Label>
              <Input type="number" value={form.estimatedValue} onChange={e => setForm(f => ({ ...f, estimatedValue: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div>
            <Label>Descrição *</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrever o item perdido/achado..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createMut.isPending}>
            {createMut.isPending ? "A criar..." : "Criar Registo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── BOOKING HISTORY VIEW ────────────────────────────────────────────────────

const CHANGE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  CREATED: { label: "Criada", color: "bg-blue-100 text-blue-800" },
  CHECKING_IN: { label: "A fazer check-in", color: "bg-cyan-100 text-cyan-800" },
  CHECK_IN: { label: "Check-in", color: "bg-green-100 text-green-800" },
  MOVEMENT: { label: "Movimento", color: "bg-amber-100 text-amber-800" },
  PENDING_CHECKOUT: { label: "Pend. Check-out", color: "bg-purple-100 text-purple-800" },
  CHECKING_OUT: { label: "A fazer check-out", color: "bg-indigo-100 text-indigo-800" },
  CHECK_OUT: { label: "Check-out", color: "bg-violet-100 text-violet-800" },
  ocorrencia: { label: "Ocorrência", color: "bg-red-100 text-red-800" },
};

function BookingHistoryView({ onBack }: { onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const importMut = trpc.lostFound.importBookingHistory.useMutation();
  const { data: history = [], isLoading, refetch } = trpc.lostFound.bookingHistory.useQuery(
    { search: activeSearch || undefined },
    { enabled: !!activeSearch }
  );
  const { data: driverStats = [] } = trpc.lostFound.bookingHistoryDriverStats.useQuery();

  const handleSearch = () => setActiveSearch(searchTerm.trim());

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const result = await importMut.mutateAsync({ fileBase64: base64, filename: file.name });
        toast.success(`Importados ${result.imported} registos (${result.skipped} duplicados)`);
        if (activeSearch) refetch();
      } catch (err: any) {
        toast.error(`Erro: ${err.message}`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleString("pt-PT") : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-500" /> Histórico de Reservas
            </h1>
            <p className="text-muted-foreground">Quem mexeu em cada carro — importar Excel do backoffice MultiPark</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importMut.isPending}>
            <Upload className="w-4 h-4 mr-2" />
            {importMut.isPending ? "A importar..." : "Importar Excel"}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por ID reserva, matrícula ou condutor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-8"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "A procurar..." : "Pesquisar"}
        </Button>
      </div>

      {/* Driver stats summary */}
      {driverStats.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actividade por Condutor (total importado)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-left">
                    <th className="p-2">Condutor</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2 text-right">Check-ins</th>
                    <th className="p-2 text-right">Check-outs</th>
                    <th className="p-2 text-right">Movimentos</th>
                  </tr>
                </thead>
                <tbody>
                  {driverStats.filter((d: any) => d.userName).map((d: any) => (
                    <tr key={d.userName} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => { setSearchTerm(d.userName); setActiveSearch(d.userName); }}>
                      <td className="p-2 font-medium">{d.userName}</td>
                      <td className="p-2 text-right">{d.total}</td>
                      <td className="p-2 text-right text-green-600">{d.checkins}</td>
                      <td className="p-2 text-right text-violet-600">{d.checkouts}</td>
                      <td className="p-2 text-right text-amber-600">{d.movements}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {activeSearch && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Resultados para "{activeSearch}" — {history.length} registos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {history.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground">Sem resultados. Importa primeiro o Excel do backoffice.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="p-2">Data</th>
                      <th className="p-2">Tipo</th>
                      <th className="p-2">Condutor</th>
                      <th className="p-2">ID Reserva</th>
                      <th className="p-2">Matrícula</th>
                      <th className="p-2">Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h: any) => {
                      const cfg = CHANGE_TYPE_CONFIG[h.changeType] || { label: h.changeType, color: "bg-gray-100 text-gray-800" };
                      return (
                        <tr key={h.id} className="border-t hover:bg-muted/30">
                          <td className="p-2 text-xs whitespace-nowrap">{fmtDate(h.actionDate)}</td>
                          <td className="p-2">
                            <Badge className={cfg.color}>{cfg.label}</Badge>
                          </td>
                          <td className="p-2 font-medium">{h.userName || "—"}</td>
                          <td className="p-2 font-mono text-xs">{h.bookingId?.slice(-12)}</td>
                          <td className="p-2 font-mono">{h.licensePlate || "—"}</td>
                          <td className="p-2 text-xs text-muted-foreground">{h.remarks || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
