import React, { useState, useMemo } from "react";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Car, AlertTriangle, Radio, Activity, Plus, Trash2, Eye, Check,
  MapPin, Gauge, ArrowUpDown, Clock, Wrench, XCircle, Satellite, Shield, Users, Settings,
  History, Smartphone, Bell, Battery, Upload, Camera, LogOut, ChevronDown, ChevronUp,
  CalendarDays, Route, Zap,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = { active: "Ativa", maintenance: "Manutenção", inactive: "Inativa" };
const STATUS_COLORS: Record<string, string> = { active: "bg-green-100 text-green-800", maintenance: "bg-amber-100 text-amber-800", inactive: "bg-red-100 text-red-800" };

export default function OperationalPage() {
  const [tab, setTab] = useState("dashboard");
  return (
    <>
      <div className="p-6 space-y-6">
        <div>
          <p className="text-muted-foreground">Viaturas, movimentos, velocidade e rádio</p>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="dashboard"><Activity className="w-4 h-4 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="gps"><Satellite className="w-4 h-4 mr-1" />GPS Tempo Real</TabsTrigger>
            <TabsTrigger value="speed"><Shield className="w-4 h-4 mr-1" />Velocidade</TabsTrigger>
            <TabsTrigger value="history"><History className="w-4 h-4 mr-1" />Histórico Diário</TabsTrigger>
            <TabsTrigger value="pdas"><Smartphone className="w-4 h-4 mr-1" />PDAs</TabsTrigger>
            <TabsTrigger value="gpsAlerts"><Bell className="w-4 h-4 mr-1" />Alertas GPS</TabsTrigger>

            <TabsTrigger value="radio"><Radio className="w-4 h-4 mr-1" />Rádio</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="gps"><ZelloGPSTab /></TabsContent>
          <TabsContent value="speed"><SpeedMonitoringTab /></TabsContent>
          <TabsContent value="history"><DriverHistoryTab /></TabsContent>
          <TabsContent value="pdas"><PdasTab /></TabsContent>
          <TabsContent value="gpsAlerts"><GpsAlertsTab /></TabsContent>

          <TabsContent value="radio"><RadioTab /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

// Posições que devem estar no terreno (excluídos: backoffice, supervisor, director)
const FIELD_POSITIONS = ["driver", "senior_driver", "extra", "frontoffice", "team_leader"];

// Novo DashboardTab: range de datas + KPIs + per-driver in-shift vs out-of-shift
function DashboardTab() {
  const [preset, setPreset] = useState<"today" | "yesterday" | "last7" | "last30" | "month" | "custom">("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    const fmt = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };
    if (preset === "custom") return { startDate: customStart, endDate: customEnd };
    if (preset === "today") return { startDate: fmt(today), endDate: fmt(today) };
    if (preset === "yesterday") {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      return { startDate: fmt(y), endDate: fmt(y) };
    }
    if (preset === "last7") {
      const s = new Date(today); s.setDate(s.getDate() - 6);
      return { startDate: fmt(s), endDate: fmt(today) };
    }
    if (preset === "last30") {
      const s = new Date(today); s.setDate(s.getDate() - 29);
      return { startDate: fmt(s), endDate: fmt(today) };
    }
    // month
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: fmt(first), endDate: fmt(today) };
  }, [preset, customStart, customEnd]);

  const { data, isLoading } = trpc.multipark.dashboardRange.useQuery(
    { startDate, endDate },
    { enabled: !!startDate && !!endDate },
  );

  const fmtEur = (n: number) => n.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

  return (
    <div className="space-y-4 mt-4">
      {/* Date range picker */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-end gap-2">
          {([
            ["today", "Hoje"],
            ["yesterday", "Ontem"],
            ["last7", "Últimos 7d"],
            ["last30", "Últimos 30d"],
            ["month", "Este mês"],
            ["custom", "Personalizado"],
          ] as const).map(([k, label]) => (
            <Button
              key={k}
              size="sm"
              variant={preset === k ? "default" : "outline"}
              onClick={() => setPreset(k)}
            >
              {label}
            </Button>
          ))}
          {preset === "custom" && (
            <>
              <div>
                <Label className="text-xs">De</Label>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-40"
                />
              </div>
              <div>
                <Label className="text-xs">Até</Label>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-40"
                />
              </div>
            </>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            {startDate} → {endDate}
          </div>
        </CardContent>
      </Card>

      {isLoading && <p className="text-sm text-muted-foreground">A carregar...</p>}

      {data && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Custo total</div>
                <div className="text-2xl font-bold">{fmtEur(data.totals.totalCost)}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {data.totals.days} dias · {data.totals.drivers} pessoas
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Acções totais</div>
                <div className="text-2xl font-bold">{data.totals.totalActions}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 flex flex-wrap gap-1">
                  {Object.entries(data.totals.byType).map(([k, v]) => (
                    <span key={k}>{k}: {v}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-200">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">No horário</div>
                <div className="text-2xl font-bold text-emerald-700">{data.totals.inShift}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {data.totals.totalActions > 0
                    ? `${((data.totals.inShift / data.totals.totalActions) * 100).toFixed(0)}%`
                    : "—"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Fora do horário</div>
                <div className="text-2xl font-bold text-amber-700">{data.totals.outOfShift}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {data.totals.totalActions > 0
                    ? `${((data.totals.outOfShift / data.totals.totalActions) * 100).toFixed(0)}%`
                    : "—"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">€/acção</div>
                <div className="text-2xl font-bold">
                  {data.totals.totalActions > 0 ? fmtEur(data.totals.costPerAction) : "—"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily breakdown */}
          {data.daily.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase text-muted-foreground">
                        <th className="text-left py-2 px-2">Dia</th>
                        <th className="text-right py-2 px-2">Pessoas</th>
                        <th className="text-right py-2 px-2">Custo</th>
                        <th className="text-right py-2 px-2">Acções</th>
                        <th className="text-right py-2 px-2 text-emerald-700">No horário</th>
                        <th className="text-right py-2 px-2 text-amber-700">Fora horário</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.daily.map((d) => (
                        <tr key={d.date} className="border-b hover:bg-muted/30">
                          <td className="py-1.5 px-2 font-mono">{d.date}</td>
                          <td className="py-1.5 px-2 text-right">{d.drivers}</td>
                          <td className="py-1.5 px-2 text-right">{fmtEur(d.totalCost)}</td>
                          <td className="py-1.5 px-2 text-right font-semibold">{d.totalActions}</td>
                          <td className="py-1.5 px-2 text-right text-emerald-700">{d.inShift}</td>
                          <td className="py-1.5 px-2 text-right text-amber-700">{d.outOfShift}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Por pessoa */}
          {data.byPerson.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por pessoa</CardTitle>
                <p className="text-xs text-muted-foreground">Ordenado por nº de acções totais</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase text-muted-foreground">
                        <th className="text-left py-2 px-2">Pessoa</th>
                        <th className="text-right py-2 px-2">Dias</th>
                        <th className="text-right py-2 px-2">Horas</th>
                        <th className="text-right py-2 px-2">Custo</th>
                        <th className="text-right py-2 px-2">Acções</th>
                        <th className="text-right py-2 px-2 text-emerald-700">No horário</th>
                        <th className="text-right py-2 px-2 text-amber-700">Fora horário</th>
                        <th className="text-right py-2 px-2">€/acção</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byPerson.map((p) => (
                        <tr key={p.personName} className="border-b hover:bg-muted/30">
                          <td className="py-1.5 px-2">
                            <div className="flex items-center gap-1.5">
                              {p.personName}
                              {p.isTeamLeader && (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[9px]">TL</Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">{p.resolvedAgentName}</div>
                          </td>
                          <td className="py-1.5 px-2 text-right">{p.daysWorked}</td>
                          <td className="py-1.5 px-2 text-right">{p.hoursPaid}</td>
                          <td className="py-1.5 px-2 text-right">{fmtEur(p.totalCost)}</td>
                          <td className="py-1.5 px-2 text-right font-semibold">{p.totalActions}</td>
                          <td className="py-1.5 px-2 text-right text-emerald-700">{p.inShiftActions}</td>
                          <td className="py-1.5 px-2 text-right text-amber-700">{p.outOfShiftActions}</td>
                          <td className="py-1.5 px-2 text-right">
                            {p.totalActions > 0 ? fmtEur(p.costPerAction) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}


// ─── ZELLO GPS TAB ──────────────────────────────────────────────────────────

function ZelloGPSTab() {
  const { data: locations, isLoading: loadingLocs, refetch: refetchLocs } = trpc.operational.zello.locations.useQuery(undefined, { refetchInterval: 30000 });
  const { data: users } = trpc.operational.zello.users.useQuery();
  const { data: channels } = trpc.operational.zello.channels.useQuery();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const onlineUsers = useMemo(() => (locations || []).filter((l: any) => l.latitude !== 0 && l.longitude !== 0), [locations]);
  const speedingUsers = useMemo(() => onlineUsers.filter((l: any) => l.speed > 50), [onlineUsers]); // default 50km/h threshold for display

  return (
    <div className="space-y-4 mt-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="w-4 h-4" />Utilizadores Zello</div>
            <p className="text-2xl font-bold mt-1">{users?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Satellite className="w-4 h-4" />Com GPS Ativo</div>
            <p className="text-2xl font-bold mt-1 text-green-600">{onlineUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Gauge className="w-4 h-4" />Em Excesso</div>
            <p className="text-2xl font-bold mt-1 text-red-600">{speedingUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Radio className="w-4 h-4" />Canais</div>
            <p className="text-2xl font-bold mt-1">{channels?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Atualização automática a cada 30s</p>
        <Button variant="outline" size="sm" onClick={() => refetchLocs()}>
          <Satellite className="w-4 h-4 mr-1" />Atualizar Agora
        </Button>
      </div>

      {/* Locations table */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Localizações em Tempo Real</CardTitle></CardHeader>
        <CardContent>
          {loadingLocs ? (
            <p className="text-center text-muted-foreground py-8">A carregar localizações...</p>
          ) : onlineUsers.length === 0 ? (
            <div className="text-center py-8">
              <Satellite className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhum utilizador com GPS ativo neste momento.</p>
              <p className="text-sm text-muted-foreground mt-1">Os condutores aparecem aqui quando a app Zello está aberta e com localização ativa.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Utilizador</th>
                    <th className="p-2">Velocidade</th>
                    <th className="p-2">Bateria</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Última Atualização</th>
                    <th className="p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {onlineUsers.map((loc: any) => {
                    const isSpeeding = loc.speed > 50;
                    const lastUpdate = loc.lastReport ? new Date(loc.lastReport * 1000).toLocaleString("pt-PT") : "-";
                    return (
                      <tr key={loc.username} className={`border-b ${isSpeeding ? "bg-red-50 dark:bg-red-950/20" : ""}`}>
                        <td className="p-2 font-medium">{loc.displayName || loc.username}</td>
                        <td className="p-2">
                          <span className={`font-bold ${isSpeeding ? "text-red-600" : "text-green-600"}`}>
                            {loc.speed.toFixed(1)} km/h
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${loc.batteryLevel > 50 ? "bg-green-500" : loc.batteryLevel > 20 ? "bg-amber-500" : "bg-red-500"}`} />
                            {loc.batteryLevel}%
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant={loc.status === "available" ? "default" : "secondary"}>
                            {loc.status === "available" ? "Online" : loc.status === "standby" ? "Standby" : loc.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">{lastUpdate}</td>
                        <td className="p-2 flex gap-1">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`} target="_blank" rel="noopener">
                              <MapPin className="w-4 h-4" />
                            </a>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channels */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Canais Zello</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(channels || []).map((ch: any) => (
              <div key={ch.name} className="border rounded-lg p-3">
                <p className="font-medium text-sm">{ch.name}</p>
                <p className="text-xs text-muted-foreground">{ch.count} membros</p>
                <div className="flex gap-1 mt-1">
                  {ch.isDispatch && <Badge variant="outline" className="text-xs">Dispatch</Badge>}
                  {ch.isShared && <Badge variant="secondary" className="text-xs">Partilhado</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Zello Users */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Todos os Utilizadores Zello ({users?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Nome</th>
                  <th className="p-2">Cargo</th>
                  <th className="p-2">Admin</th>
                  <th className="p-2">GPS</th>
                  <th className="p-2">Canais</th>
                </tr>
              </thead>
              <tbody>
                {(users || []).map((u: any) => (
                  <tr key={u.name} className="border-b">
                    <td className="p-2 font-medium">{u.fullName || u.name}</td>
                    <td className="p-2 text-muted-foreground">{u.job || "-"}</td>
                    <td className="p-2">{u.admin ? <Badge>Admin</Badge> : "-"}</td>
                    <td className="p-2">{u.geotrackingOff ? <Badge variant="destructive">Desligado</Badge> : <Badge variant="outline">Ativo</Badge>}</td>
                    <td className="p-2 text-xs text-muted-foreground">{u.channels?.join(", ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── SPEED MONITORING TAB ───────────────────────────────────────────────────

function SpeedMonitoringTab() {
  const [subTab, setSubTab] = useState<"violations" | "limits" | "check">("violations");
  const utils = trpc.useUtils();

  // Speed limits
  const { data: limits } = trpc.operational.speedMonitoring.limits.list.useQuery();
  const createLimitMut = trpc.operational.speedMonitoring.limits.create.useMutation({
    onSuccess: () => { utils.operational.speedMonitoring.limits.list.invalidate(); toast.success("Limite criado"); setShowCreateLimit(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteLimitMut = trpc.operational.speedMonitoring.limits.delete.useMutation({
    onSuccess: () => { utils.operational.speedMonitoring.limits.list.invalidate(); toast.success("Limite eliminado"); },
    onError: (e) => toast.error(e.message),
  });

  // Violations
  const [filterAck, setFilterAck] = useState<string>("");
  const { data: violations } = trpc.operational.speedMonitoring.violations.list.useQuery(
    filterAck !== "" ? { acknowledged: filterAck === "true" } : undefined
  );
  const { data: stats } = trpc.operational.speedMonitoring.violations.stats.useQuery();
  const ackMut = trpc.operational.speedMonitoring.violations.acknowledge.useMutation({
    onSuccess: () => { utils.operational.speedMonitoring.violations.list.invalidate(); utils.operational.speedMonitoring.violations.stats.invalidate(); toast.success("Infração reconhecida"); },
    onError: (e) => toast.error(e.message),
  });

  // Check now
  const checkMut = trpc.operational.speedMonitoring.checkNow.useMutation({
    onSuccess: (data) => {
      utils.operational.speedMonitoring.violations.list.invalidate();
      utils.operational.speedMonitoring.violations.stats.invalidate();
      if (data.violations > 0) {
        toast.warning(`${data.violations} infração(ões) detetada(s) em ${data.checked} condutores!`);
      } else {
        toast.success(`${data.checked} condutores verificados, sem infrações.`);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const [showCreateLimit, setShowCreateLimit] = useState(false);
  const [newLimit, setNewLimit] = useState({ name: "", maxSpeed: 50, tolerancePercent: 10, isDefault: false });
  const [ackNotes, setAckNotes] = useState("");
  const [ackId, setAckId] = useState<number | null>(null);

  return (
    <div className="space-y-4 mt-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><AlertTriangle className="w-4 h-4" />Total Infrações</div>
            <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><XCircle className="w-4 h-4" />Pendentes</div>
            <p className="text-2xl font-bold mt-1 text-red-600">{stats?.unacknowledged || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Settings className="w-4 h-4" />Limites Ativos</div>
            <p className="text-2xl font-bold mt-1">{limits?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="w-4 h-4" />Top Infrator</div>
            <p className="text-lg font-bold mt-1 truncate">{stats?.topOffenders?.[0]?.displayName || "-"}</p>
            {stats?.topOffenders?.[0] && <p className="text-xs text-muted-foreground">{stats.topOffenders[0].count} infrações, +{stats.topOffenders[0].avgExcess}% média</p>}
          </CardContent>
        </Card>
      </div>

      {/* Check Now button */}
      <div className="flex items-center gap-3">
        <Button onClick={() => checkMut.mutate()} disabled={checkMut.isPending} className="bg-red-600 hover:bg-red-700">
          <Gauge className="w-4 h-4 mr-1" />{checkMut.isPending ? "A verificar..." : "Verificar Velocidades Agora"}
        </Button>
        <p className="text-sm text-muted-foreground">Verifica todos os condutores com GPS ativo e regista infrações automaticamente.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button variant={subTab === "violations" ? "default" : "ghost"} size="sm" onClick={() => setSubTab("violations")}>Infrações</Button>
        <Button variant={subTab === "limits" ? "default" : "ghost"} size="sm" onClick={() => setSubTab("limits")}>Limites de Velocidade</Button>
      </div>

      {subTab === "violations" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={filterAck} onValueChange={v => setFilterAck(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="false">Pendentes</SelectItem>
                <SelectItem value="true">Reconhecidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Top Offenders */}
          {stats?.topOffenders && stats.topOffenders.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Top Infratores</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {stats.topOffenders.map((o: any) => (
                    <div key={o.username} className="border rounded-lg p-2 text-sm">
                      <p className="font-medium">{o.displayName}</p>
                      <p className="text-xs text-muted-foreground">{o.count} infrações · +{o.avgExcess}% média</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Violations table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Data</th><th className="p-2">Condutor</th>
                  <th className="p-2">Velocidade</th><th className="p-2">Limite</th><th className="p-2">Excesso</th>
                  <th className="p-2">GPS</th><th className="p-2">Estado</th><th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(!violations || violations.length === 0) ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Sem infrações de velocidade registadas.</td></tr>
                ) : violations.map((v: any) => (
                  <tr key={v.id} className={`border-b ${!v.acknowledged ? "bg-red-50 dark:bg-red-950/20" : ""}`}>
                    <td className="p-2 text-xs">{new Date(v.occurredAt).toLocaleString("pt-PT")}</td>
                    <td className="p-2 font-medium">{v.displayName || v.zelloUsername}</td>
                    <td className="p-2 font-bold text-red-600">{parseFloat(v.speed).toFixed(1)} km/h</td>
                    <td className="p-2">{v.speedLimit} km/h</td>
                    <td className="p-2 font-bold text-red-600">+{parseFloat(v.excessPercent).toFixed(0)}%</td>
                    <td className="p-2">
                      {v.latitude && v.longitude ? (
                        <a href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`} target="_blank" rel="noopener" className="text-blue-600 hover:underline flex items-center gap-1">
                          <MapPin className="w-3 h-3" />Ver
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-2">
                      {v.acknowledged ? <Badge variant="outline">Reconhecido</Badge> : <Badge variant="destructive">Pendente</Badge>}
                    </td>
                    <td className="p-2">
                      {!v.acknowledged && (
                        <Button size="sm" variant="outline" onClick={() => setAckId(v.id)} title="Reconhecer">
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === "limits" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateLimit(true)}><Plus className="w-4 h-4 mr-1" />Novo Limite</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(limits || []).map((l: any) => (
              <Card key={l.id}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{l.name}</p>
                      <p className="text-2xl font-bold text-blue-600">{l.maxSpeed} km/h</p>
                      <p className="text-xs text-muted-foreground">Tolerância: {l.tolerancePercent}% (alerta a {Math.round(l.maxSpeed * (1 + l.tolerancePercent / 100))} km/h)</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {l.isDefault && <Badge>Padrão</Badge>}
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteLimitMut.mutate({ id: l.id })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!limits || limits.length === 0) && (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p>Nenhum limite de velocidade configurado.</p>
                <p className="text-sm mt-1">Cria um limite padrão para começar a monitorizar.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Limit Dialog */}
      {showCreateLimit && (
        <Dialog open onOpenChange={() => setShowCreateLimit(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Limite de Velocidade</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={newLimit.name} onChange={e => setNewLimit(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Cidade, Autoestrada, Parque" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Velocidade Máxima (km/h)</Label>
                  <Input type="number" value={newLimit.maxSpeed} onChange={e => setNewLimit(p => ({ ...p, maxSpeed: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Tolerância (%)</Label>
                  <Input type="number" value={newLimit.tolerancePercent} onChange={e => setNewLimit(p => ({ ...p, tolerancePercent: Number(e.target.value) }))} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Alerta dispara a: <strong>{Math.round(newLimit.maxSpeed * (1 + newLimit.tolerancePercent / 100))} km/h</strong></p>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isDefault" checked={newLimit.isDefault} onChange={e => setNewLimit(p => ({ ...p, isDefault: e.target.checked }))} />
                <Label htmlFor="isDefault">Limite padrão (usado na verificação automática)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateLimit(false)}>Cancelar</Button>
              <Button onClick={() => createLimitMut.mutate(newLimit)} disabled={!newLimit.name || createLimitMut.isPending}>
                {createLimitMut.isPending ? "A criar..." : "Criar Limite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Acknowledge Dialog */}
      {ackId !== null && (
        <Dialog open onOpenChange={() => { setAckId(null); setAckNotes(""); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reconhecer Infração</DialogTitle></DialogHeader>
            <div>
              <Label>Notas (opcional)</Label>
              <Textarea value={ackNotes} onChange={e => setAckNotes(e.target.value)} placeholder="Observações sobre esta infração..." />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAckId(null); setAckNotes(""); }}>Cancelar</Button>
              <Button onClick={() => { ackMut.mutate({ id: ackId, notes: ackNotes || undefined }); setAckId(null); setAckNotes(""); }}>
                Reconhecer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


// ─── DRIVER HISTORY TAB ─────────────────────────────────────────────────────

function DriverHistoryTab() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1); // default to yesterday
    return d.toISOString().split("T")[0];
  });
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: history, isLoading } = trpc.operational.driverHistory.byDate.useQuery({ date: selectedDate });
  const { data: stats } = trpc.operational.driverHistory.stats.useQuery({ date: selectedDate });
  const collectMut = trpc.operational.driverHistory.collectDay.useMutation({
    onSuccess: (data) => {
      utils.operational.driverHistory.byDate.invalidate();
      utils.operational.driverHistory.stats.invalidate();
      if (data.success) {
        toast.success(`Recolha concluída: ${data.driversProcessed} motoristas processados`);
      } else {
        toast.error("Erro na recolha");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const { data: userHistory } = trpc.operational.driverHistory.byUser.useQuery(
    { username: expandedUser || "", limit: 14 },
    { enabled: !!expandedUser }
  );

  return (
    <div className="space-y-4 mt-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-[180px]"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => collectMut.mutate({ date: selectedDate })}
          disabled={collectMut.isPending}
        >
          {collectMut.isPending ? "A recolher..." : "Recolher Dados"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Recolha automática: todos os dias às 2:00 (dados do dia anterior)
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Motoristas</p>
            <p className="text-xl font-bold">{stats?.totalDrivers ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Km Total</p>
            <p className="text-xl font-bold">{(stats?.totalKm ?? 0).toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Horas Trabalho</p>
            <p className="text-xl font-bold">{(stats?.totalHoursWorked ?? 0).toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Horas Parado</p>
            <p className="text-xl font-bold">{(stats?.totalHoursStopped ?? 0).toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Vel. Máx</p>
            <p className="text-xl font-bold text-red-600">{(stats?.maxSpeedOfDay ?? 0).toFixed(0)} km/h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Bat. Média</p>
            <p className="text-xl font-bold">{stats?.avgBattery ?? 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Infrações</p>
            <p className="text-xl font-bold text-amber-600">{stats?.totalViolations ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de {selectedDate}
            {history && <Badge variant="outline">{history.length} registos</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">A carregar...</p>
          ) : !history || history.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Sem dados para esta data.</p>
              <p className="text-sm text-muted-foreground mt-1">Usa o botão "Recolher Dados" para importar dados do Zello.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Motorista</th>
                    <th className="p-2 text-right">Km</th>
                    <th className="p-2 text-right">Horas Trab.</th>
                    <th className="p-2 text-right">Horas Parado</th>
                    <th className="p-2 text-right">Vel. Média</th>
                    <th className="p-2 text-right">Vel. Máx</th>
                    <th className="p-2 text-right">Infrações</th>
                    <th className="p-2 text-right">Bateria</th>
                    <th className="p-2 text-right">Pontos GPS</th>
                    <th className="p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h: any) => (
                    <React.Fragment key={h.id}>
                      <tr key={h.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setExpandedUser(expandedUser === h.zelloUsername ? null : h.zelloUsername)}>
                        <td className="p-2 font-medium flex items-center gap-1">
                          {expandedUser === h.zelloUsername ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {h.displayName || h.zelloUsername}
                        </td>
                        <td className="p-2 text-right font-mono">{parseFloat(h.totalKm || "0").toFixed(1)}</td>
                        <td className="p-2 text-right font-mono">{parseFloat(h.hoursWorked || "0").toFixed(1)}h</td>
                        <td className="p-2 text-right font-mono">{parseFloat(h.hoursStopped || "0").toFixed(1)}h</td>
                        <td className="p-2 text-right font-mono">{parseFloat(h.avgSpeed || "0").toFixed(1)}</td>
                        <td className="p-2 text-right font-mono">
                          <span className={parseFloat(h.maxSpeed || "0") > 50 ? "text-red-600 font-bold" : ""}>
                            {parseFloat(h.maxSpeed || "0").toFixed(1)}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          {h.speedViolations > 0 ? (
                            <Badge variant="destructive">{h.speedViolations}</Badge>
                          ) : (
                            <span className="text-green-600">0</span>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <div className={`w-2 h-2 rounded-full ${(h.avgBattery || 0) > 50 ? "bg-green-500" : (h.avgBattery || 0) > 20 ? "bg-amber-500" : "bg-red-500"}`} />
                            {h.avgBattery || 0}%
                          </div>
                        </td>
                        <td className="p-2 text-right text-muted-foreground">{h.gpsPointsCount || 0}</td>
                        <td className="p-2">
                          {h.geoJsonUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={h.geoJsonUrl} target="_blank" rel="noopener"><Route className="w-3 h-3" /></a>
                            </Button>
                          )}
                        </td>
                      </tr>
                      {expandedUser === h.zelloUsername && userHistory && (
                        <tr key={`${h.id}-history`}>
                          <td colSpan={10} className="p-0">
                            <div className="bg-muted/30 p-3 border-b">
                              <p className="text-xs font-medium mb-2">Últimos 14 dias — {h.displayName || h.zelloUsername}</p>
                              <div className="grid grid-cols-7 gap-1">
                                {userHistory.map((uh: any) => (
                                  <div key={uh.id} className="text-center text-xs border rounded p-1 bg-background">
                                    <p className="font-medium">{new Date(uh.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })}</p>
                                    <p className="text-muted-foreground">{parseFloat(uh.totalKm || "0").toFixed(0)}km</p>
                                    <p className="text-muted-foreground">{parseFloat(uh.hoursWorked || "0").toFixed(1)}h</p>
                                    {uh.speedViolations > 0 && <Badge variant="destructive" className="text-[10px] px-1">{uh.speedViolations}</Badge>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

// ─── PDAs TAB ───────────────────────────────────────────────────────────────

function PdasTab() {
  const [showCreate, setShowCreate] = useState(false);
  const [showCheckin, setShowCheckin] = useState<number | null>(null);
  const [editPda, setEditPda] = useState<any | null>(null);
  const [viewPda, setViewPda] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data: pdaList, isLoading } = trpc.operational.pdas.list.useQuery();
  const { data: activeCheckins } = trpc.operational.pdas.checkins.active.useQuery();
  const deleteMut = trpc.operational.pdas.delete.useMutation({
    onSuccess: () => { utils.operational.pdas.list.invalidate(); toast.success("PDA eliminado"); },
    onError: (e) => toast.error(e.message),
  });

  const PDA_STATUS_LABELS: Record<string, string> = { active: "Ativo", inactive: "Inativo", maintenance: "Manutenção", lost: "Perdido" };
  const PDA_STATUS_COLORS: Record<string, string> = { active: "bg-green-100 text-green-800", inactive: "bg-gray-100 text-gray-800", maintenance: "bg-amber-100 text-amber-800", lost: "bg-red-100 text-red-800" };

  // Map active checkins to PDA IDs
  const checkinByPda = useMemo(() => {
    const m = new Map<number, any>();
    (activeCheckins || []).forEach((c: any) => m.set(c.pdaId, c));
    return m;
  }, [activeCheckins]);

  return (
    <div className="space-y-4 mt-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Total PDAs</p>
            <p className="text-xl font-bold">{pdaList?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Ativos</p>
            <p className="text-xl font-bold text-green-600">{(pdaList || []).filter((p: any) => p.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Em Uso (Check-in)</p>
            <p className="text-xl font-bold text-blue-600">{activeCheckins?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Manutenção/Perdido</p>
            <p className="text-xl font-bold text-amber-600">{(pdaList || []).filter((p: any) => p.status === "maintenance" || p.status === "lost").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" />Novo PDA</Button>
      </div>

      {/* PDA Cards */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">A carregar...</p>
      ) : !pdaList || pdaList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Smartphone className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p>Sem PDAs registados. Adiciona o primeiro dispositivo.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pdaList.map((pda: any) => {
            const checkin = checkinByPda.get(pda.id);
            return (
              <Card key={pda.id} className={checkin ? "border-blue-300 dark:border-blue-700" : ""}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <span className="font-bold">{pda.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PDA_STATUS_COLORS[pda.status]}`}>
                      {PDA_STATUS_LABELS[pda.status]}
                    </span>
                  </div>

                  <div className="text-sm space-y-1 text-muted-foreground">
                    {pda.model && <p>Modelo: {pda.model}</p>}
                    {pda.phoneNumber && <p>Nº: {pda.phoneNumber}</p>}
                    {pda.simDataPlan && <p>Plano: {pda.simDataPlan}</p>}
                    {pda.imei && <p className="text-xs">IMEI: {pda.imei}</p>}
                  </div>

                  {checkin && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2 text-sm">
                      <p className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Em uso
                      </p>
                      {checkin.zelloUsername && <p className="text-xs">Zello: {checkin.zelloUsername}</p>}
                      <p className="text-xs text-muted-foreground">
                        Desde {new Date(checkin.checkinAt).toLocaleString("pt-PT")}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-1 flex-wrap">
                    {!checkin && pda.status === "active" && (
                      <Button size="sm" variant="default" onClick={() => setShowCheckin(pda.id)}>
                        <Camera className="w-3 h-3 mr-1" />Check-in
                      </Button>
                    )}
                    {checkin && (
                      <CheckoutButton checkinId={checkin.id} pdaName={pda.name} />
                    )}
                    <Button size="sm" variant="outline" onClick={() => setEditPda(pda)}>
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setViewPda(pda.id)}>
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => {
                      if (confirm(`Eliminar PDA ${pda.name}?`)) deleteMut.mutate({ id: pda.id });
                    }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      {showCreate && <CreatePdaDialog onClose={() => setShowCreate(false)} />}
      {editPda && <EditPdaDialog pda={editPda} onClose={() => setEditPda(null)} />}
      {showCheckin !== null && <CheckinDialog pdaId={showCheckin} onClose={() => setShowCheckin(null)} />}
      {viewPda !== null && <PdaHistoryDialog pdaId={viewPda} onClose={() => setViewPda(null)} />}
    </div>
  );
}

function CheckoutButton({ checkinId, pdaName }: { checkinId: number; pdaName: string }) {
  const utils = trpc.useUtils();
  const checkoutMut = trpc.operational.pdas.checkins.checkout.useMutation({
    onSuccess: () => {
      utils.operational.pdas.checkins.active.invalidate();
      toast.success(`Check-out ${pdaName} concluído`);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Button size="sm" variant="secondary" onClick={() => checkoutMut.mutate({ id: checkinId })} disabled={checkoutMut.isPending}>
      <LogOut className="w-3 h-3 mr-1" />{checkoutMut.isPending ? "..." : "Check-out"}
    </Button>
  );
}

function CreatePdaDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [imei, setImei] = useState("");
  const [model, setModel] = useState("");
  const [simDataPlan, setSimDataPlan] = useState("");
  const [notes, setNotes] = useState("");
  const utils = trpc.useUtils();

  const createMut = trpc.operational.pdas.create.useMutation({
    onSuccess: () => { utils.operational.pdas.list.invalidate(); toast.success("PDA criado"); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo PDA</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nome *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: PDA-001" /></div>
          <div><Label>Modelo</Label><Input value={model} onChange={e => setModel(e.target.value)} placeholder="Ex: Samsung Galaxy XCover" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nº Telemóvel</Label><Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Ex: 912345678" /></div>
            <div><Label>IMEI</Label><Input value={imei} onChange={e => setImei(e.target.value)} placeholder="IMEI do dispositivo" /></div>
          </div>
          <div><Label>Plano de Dados</Label><Input value={simDataPlan} onChange={e => setSimDataPlan(e.target.value)} placeholder="Ex: 5GB NOS" /></div>
          <div><Label>Notas</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observações..." /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!name || createMut.isPending} onClick={() => createMut.mutate({
            name, phoneNumber: phoneNumber || undefined, imei: imei || undefined,
            model: model || undefined, simDataPlan: simDataPlan || undefined, notes: notes || undefined,
          })}>{createMut.isPending ? "A criar..." : "Criar PDA"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditPdaDialog({ pda, onClose }: { pda: any; onClose: () => void }) {
  const [name, setName] = useState(pda.name);
  const [phoneNumber, setPhoneNumber] = useState(pda.phoneNumber || "");
  const [imei, setImei] = useState(pda.imei || "");
  const [model, setModel] = useState(pda.model || "");
  const [simDataPlan, setSimDataPlan] = useState(pda.simDataPlan || "");
  const [status, setStatus] = useState(pda.status);
  const [notes, setNotes] = useState(pda.notes || "");
  const utils = trpc.useUtils();

  const updateMut = trpc.operational.pdas.update.useMutation({
    onSuccess: () => { utils.operational.pdas.list.invalidate(); toast.success("PDA atualizado"); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar PDA — {pda.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>Modelo</Label><Input value={model} onChange={e => setModel(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nº Telemóvel</Label><Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} /></div>
            <div><Label>IMEI</Label><Input value={imei} onChange={e => setImei(e.target.value)} /></div>
          </div>
          <div><Label>Plano de Dados</Label><Input value={simDataPlan} onChange={e => setSimDataPlan(e.target.value)} /></div>
          <div>
            <Label>Estado</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Notas</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={updateMut.isPending} onClick={() => updateMut.mutate({
            id: pda.id,
            data: { name, phoneNumber: phoneNumber || null, imei: imei || null, model: model || null, simDataPlan: simDataPlan || null, status: status as any, notes: notes || null },
          })}>{updateMut.isPending ? "A guardar..." : "Guardar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckinDialog({ pdaId, onClose }: { pdaId: number; onClose: () => void }) {
  const [zelloUsername, setZelloUsername] = useState("");
  const [mobileDataMbStart, setMobileDataMbStart] = useState("");
  const [notes, setNotes] = useState("");
  const [photoEntryUrl, setPhotoEntryUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const utils = trpc.useUtils();

  const { data: zelloUsers } = trpc.operational.zello.users.useQuery();
  const { data: employees } = trpc.rh.list.useQuery();
  const [employeeId, setEmployeeId] = useState("");

  const checkinMut = trpc.operational.pdas.checkins.checkin.useMutation({
    onSuccess: () => {
      utils.operational.pdas.checkins.active.invalidate();
      toast.success("Check-in registado!");
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resp = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await resp.json();
      setPhotoEntryUrl(url);
      toast.success("Foto carregada!");
    } catch {
      toast.error("Erro ao carregar foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Check-in PDA #{pdaId}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Utilizador Zello</Label>
            <Select value={zelloUsername} onValueChange={setZelloUsername}>
              <SelectTrigger><SelectValue placeholder="Selecionar utilizador..." /></SelectTrigger>
              <SelectContent>
                {(zelloUsers || []).filter((u: any) => !u.admin).map((u: any) => (
                  <SelectItem key={u.name} value={u.name}>{u.fullName || u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Funcionário (opcional)</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue placeholder="Associar funcionário..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {(employees || []).map((e: any) => (
                  <SelectItem key={e.employee.id} value={String(e.employee.id)}>{e.employee.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Dados Móveis (MB no início)</Label>
            <Input type="number" value={mobileDataMbStart} onChange={e => setMobileDataMbStart(e.target.value)} placeholder="Ex: 2500" />
          </div>
          <div>
            <Label>Foto de Entrada</Label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
                <Button variant="outline" asChild><span><Camera className="w-4 h-4 mr-1" />{uploading ? "A carregar..." : "Tirar Foto"}</span></Button>
              </label>
              {photoEntryUrl && <Badge variant="outline" className="text-green-600">Foto OK</Badge>}
            </div>
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observações..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={checkinMut.isPending || uploading} onClick={() => checkinMut.mutate({
            pdaId,
            zelloUsername: zelloUsername || undefined,
            employeeId: employeeId && employeeId !== "none" ? Number(employeeId) : undefined,
            photoEntryUrl: photoEntryUrl || undefined,
            mobileDataMbStart: mobileDataMbStart ? Number(mobileDataMbStart) : undefined,
            notes: notes || undefined,
          })}>{checkinMut.isPending ? "A registar..." : "Registar Check-in"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PdaHistoryDialog({ pdaId, onClose }: { pdaId: number; onClose: () => void }) {
  const { data: checkins, isLoading } = trpc.operational.pdas.checkins.byPda.useQuery({ pdaId });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Histórico PDA #{pdaId}</DialogTitle></DialogHeader>
        {isLoading ? (
          <p className="text-center py-4 text-muted-foreground">A carregar...</p>
        ) : !checkins || checkins.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">Sem registos de check-in.</p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Utilizador</th>
                  <th className="p-2">Check-in</th>
                  <th className="p-2">Check-out</th>
                  <th className="p-2">Dados</th>
                  <th className="p-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {checkins.map((c: any) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-2 font-medium">{c.zelloUsername || `Emp #${c.employeeId}`}</td>
                    <td className="p-2 text-muted-foreground">{new Date(c.checkinAt).toLocaleString("pt-PT")}</td>
                    <td className="p-2 text-muted-foreground">{c.checkoutAt ? new Date(c.checkoutAt).toLocaleString("pt-PT") : "-"}</td>
                    <td className="p-2 text-xs">
                      {c.mobileDataMbStart != null && c.mobileDataMbEnd != null
                        ? `${c.mobileDataMbEnd - c.mobileDataMbStart} MB`
                        : c.mobileDataMbStart != null ? `Início: ${c.mobileDataMbStart} MB` : "-"}
                    </td>
                    <td className="p-2">
                      <Badge variant={c.status === "checked_in" ? "default" : "secondary"}>
                        {c.status === "checked_in" ? "Em uso" : "Devolvido"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── GPS ALERTS TAB ─────────────────────────────────────────────────────────

function GpsAlertsTab() {
  const [showUnackOnly, setShowUnackOnly] = useState(false);
  const utils = trpc.useUtils();

  const { data: alerts, isLoading } = trpc.operational.gpsAlerts.list.useQuery(
    showUnackOnly ? { unacknowledgedOnly: true } : undefined
  );
  const { data: alertStats } = trpc.operational.gpsAlerts.stats.useQuery();
  const ackMut = trpc.operational.gpsAlerts.acknowledge.useMutation({
    onSuccess: () => {
      utils.operational.gpsAlerts.list.invalidate();
      utils.operational.gpsAlerts.stats.invalidate();
      toast.success("Alerta reconhecido");
    },
    onError: (e) => toast.error(e.message),
  });
  const checkMut = trpc.operational.gpsAlerts.checkNow.useMutation({
    onSuccess: (data) => {
      utils.operational.gpsAlerts.list.invalidate();
      utils.operational.gpsAlerts.stats.invalidate();
      if (data.alertsCreated > 0) {
        toast.warning(`${data.alertsCreated} alerta(s) criado(s)!`);
      } else {
        toast.success("Verificação concluída, sem alertas.");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const ALERT_TYPE_LABELS: Record<string, string> = {
    gps_off: "GPS Desligado",
    zello_off: "Zello Desligado",
    battery_low: "Bateria Baixa",
    no_signal: "Sem Sinal",
  };
  const ALERT_TYPE_ICONS: Record<string, React.ReactNode> = {
    gps_off: <Satellite className="w-4 h-4 text-red-500" />,
    zello_off: <XCircle className="w-4 h-4 text-red-500" />,
    battery_low: <Battery className="w-4 h-4 text-amber-500" />,
    no_signal: <Zap className="w-4 h-4 text-gray-500" />,
  };

  return (
    <div className="space-y-4 mt-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Total Alertas</p>
            <p className="text-xl font-bold">{alertStats?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Não Reconhecidos</p>
            <p className="text-xl font-bold text-red-600">{alertStats?.unacknowledged ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">Hoje</p>
            <p className="text-xl font-bold text-amber-600">{alertStats?.todayAlerts ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <p className="text-xs text-muted-foreground">GPS Desligado</p>
            <p className="text-xl font-bold">{alertStats?.byType?.gps_off ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="default"
          onClick={() => checkMut.mutate()}
          disabled={checkMut.isPending}
        >
          <Satellite className="w-4 h-4 mr-1" />
          {checkMut.isPending ? "A verificar..." : "Verificar Agora"}
        </Button>
        <Button
          variant={showUnackOnly ? "secondary" : "outline"}
          onClick={() => setShowUnackOnly(!showUnackOnly)}
        >
          <Bell className="w-4 h-4 mr-1" />
          {showUnackOnly ? "Mostrar Todos" : "Só Pendentes"}
        </Button>
      </div>

      {/* Alerts list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertas GPS
            {alerts && <Badge variant="outline">{alerts.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">A carregar...</p>
          ) : !alerts || alerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Sem alertas GPS.</p>
              <p className="text-sm text-muted-foreground mt-1">Usa "Verificar Agora" para verificar o estado do GPS de todos os condutores.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    !alert.acknowledged ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {ALERT_TYPE_ICONS[alert.alertType] || <AlertTriangle className="w-4 h-4" />}
                    <div>
                      <p className="font-medium text-sm">{alert.displayName || alert.zelloUsername}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(alert.occurredAt).toLocaleString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.acknowledged ? "secondary" : "destructive"}>
                      {ALERT_TYPE_LABELS[alert.alertType] || alert.alertType}
                    </Badge>
                    {alert.batteryLevel != null && (
                      <span className="text-xs text-muted-foreground">{alert.batteryLevel}%</span>
                    )}
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => ackMut.mutate({ id: alert.id })}
                        disabled={ackMut.isPending}
                      >
                        <Check className="w-3 h-3 mr-1" />OK
                      </Button>
                    )}
                    {alert.acknowledged && (
                      <Badge variant="outline" className="text-green-600 text-xs">Reconhecido</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
function RadioTab() {
  const [showTranscribe, setShowTranscribe] = useState(false);
  const { data: transcriptions } = trpc.operational.radio.list.useQuery();
  const { data: employees } = trpc.rh.list.useQuery();
  const { data: vehiclesList } = trpc.operational.vehicles.list.useQuery();

  const empMap = useMemo(() => {
    const m = new Map<number, string>();
    (employees || []).forEach((e: any) => m.set(e.employee.id, e.employee.fullName));
    return m;
  }, [employees]);
  const vehMap = useMemo(() => {
    const m = new Map<number, string>();
    (vehiclesList || []).forEach((v: any) => m.set(v.id, v.plate));
    return m;
  }, [vehiclesList]);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Transcrições de comunicações rádio</p>
        <Button onClick={() => setShowTranscribe(true)}><Plus className="w-4 h-4 mr-1" />Nova Transcrição</Button>
      </div>

      <div className="grid gap-4">
        {(!transcriptions || transcriptions.length === 0) ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Sem transcrições. Carrega um áudio para começar.</CardContent></Card>
        ) : transcriptions.map((t: any) => (
          <Card key={t.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{new Date(t.createdAt).toLocaleString("pt-PT")}</span>
                  {t.employeeId && <Badge variant="outline">{empMap.get(t.employeeId) || `#${t.employeeId}`}</Badge>}
                  {t.vehicleId && <Badge variant="secondary">{vehMap.get(t.vehicleId) || `#${t.vehicleId}`}</Badge>}
                  {t.duration && <span className="text-xs text-muted-foreground">{Math.floor(t.duration / 60)}:{String(t.duration % 60).padStart(2, "0")}</span>}
                </div>
                {t.audioUrl && <a href={t.audioUrl} target="_blank" rel="noopener"><Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1" />Áudio</Button></a>}
              </div>
              {t.summary && <p className="text-sm font-medium bg-muted/50 p-2 rounded">{t.summary}</p>}
              {t.transcription && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t.transcription}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {showTranscribe && <TranscribeDialog employees={employees || []} vehicles={vehiclesList || []} onClose={() => setShowTranscribe(false)} />}
    </div>
  );
}

function TranscribeDialog({ employees, vehicles, onClose }: { employees: any[]; vehicles: any[]; onClose: () => void }) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [uploading, setUploading] = useState(false);
  const utils = trpc.useUtils();
  const transcribeMut = trpc.operational.radio.transcribe.useMutation({
    onSuccess: (data) => { utils.operational.radio.list.invalidate(); toast.success("Transcrição concluída!"); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = async () => {
    if (!audioFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      const resp = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await resp.json();
      transcribeMut.mutate({
        audioUrl: url,
        employeeId: employeeId && employeeId !== "none" ? Number(employeeId) : undefined,
        vehicleId: vehicleId && vehicleId !== "none" ? Number(vehicleId) : undefined,
        duration: undefined,
      });
    } catch {
      toast.error("Erro ao carregar áudio");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Transcrever Áudio de Rádio</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Ficheiro Áudio *</Label>
            <Input type="file" accept="audio/*,.webm,.mp3,.wav,.ogg,.m4a" onChange={e => setAudioFile(e.target.files?.[0] || null)} />
          </div>
          <div><Label>Condutor</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">N/A</SelectItem>
                {employees.map((e: any) => <SelectItem key={e.employee.id} value={String(e.employee.id)}>{e.employee.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Viatura</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">N/A</SelectItem>
                {vehicles.map((v: any) => <SelectItem key={v.id} value={String(v.id)}>{v.plate} - {v.brand} {v.model}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!audioFile || uploading || transcribeMut.isPending} onClick={handleSubmit}>
            {uploading || transcribeMut.isPending ? "A processar..." : "Transcrever"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
