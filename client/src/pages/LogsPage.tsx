import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ScrollText, Loader2, AlertCircle, User, Receipt, Trash2, Edit, Plus, Download,
} from "lucide-react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const ACTION_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  create: { label: "Criou", icon: Plus, color: "text-green-600" },
  update: { label: "Atualizou", icon: Edit, color: "text-blue-600" },
  delete: { label: "Eliminou", icon: Trash2, color: "text-red-600" },
  update_role: { label: "Alterou role de", icon: User, color: "text-purple-600" },
};

export default function LogsPage() {
  const { user: currentUser } = useAuth();
  const [limit, setLimit] = useState(500);
  const [entity, setEntity] = useState<string>("all");
  const [action, setAction] = useState<string>("all");
  const [search, setSearch] = useState("");

  const queryInput = useMemo(() => {
    const i: any = { limit };
    if (entity !== "all") i.entity = entity;
    if (action !== "all") i.action = action;
    return i;
  }, [limit, entity, action]);

  const { data: logs = [], isLoading } = trpc.logs.list.useQuery(queryInput, {
    enabled: currentUser?.role === "super_admin",
  });

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return logs;
    return logs.filter((item: any) => {
      const log = item.log ?? item;
      const u = item.user ?? null;
      return (
        (log.details ?? "").toLowerCase().includes(s) ||
        (log.entity ?? "").toLowerCase().includes(s) ||
        (u?.name ?? "").toLowerCase().includes(s)
      );
    });
  }, [logs, search]);

  const entityOptions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((item: any) => {
      const e = (item.log ?? item).entity;
      if (e) set.add(e);
    });
    return Array.from(set).sort();
  }, [logs]);

  const exportCsv = () => {
    const headers = ["Data", "Utilizador", "Ação", "Entidade", "EntityID", "Detalhes"];
    const rows = filtered.map((item: any) => {
      const log = item.log ?? item;
      const u = item.user ?? null;
      return [
        log.createdAt ? new Date(log.createdAt).toISOString() : "",
        (u?.name ?? "Sistema").replace(/;/g, ","),
        log.action ?? "",
        log.entity ?? "",
        log.entityId ?? "",
        (log.details ?? "").replace(/[;\n\r]/g, " "),
      ];
    });
    const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (currentUser?.role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">Acesso restrito</p>
        <p className="text-sm text-muted-foreground mt-1">Apenas o Super Admin pode ver os logs de atividade</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full">
      <p className="text-sm text-muted-foreground">
        Registo completo de todas as ações na plataforma · {filtered.length} entradas {filtered.length !== logs.length ? `(filtradas de ${logs.length})` : ""}
      </p>

      {/* Filtros */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <Label className="text-xs">Pesquisar</Label>
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Detalhes, entidade ou utilizador..."
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Entidade</Label>
            <Select value={entity} onValueChange={setEntity}>
              <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {entityOptions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Ação</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(ACTION_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Limite</Label>
            <Select value={String(limit)} onValueChange={v => setLimit(parseInt(v))}>
              <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[200, 500, 1000, 2000].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" disabled={filtered.length === 0} onClick={exportCsv}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ScrollText className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Nenhum log com os filtros atuais</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((item: any) => {
                const logEntry = item.log ?? item;
                const logUser = item.user ?? null;
                const actionCfg = ACTION_CONFIG[logEntry.action] ?? { label: logEntry.action, icon: Receipt, color: "text-muted-foreground" };
                const Icon = actionCfg.icon;
                return (
                  <div key={logEntry.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className={`mt-0.5 shrink-0 ${actionCfg.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-sm">
                        <span className="font-medium text-foreground">{logUser?.name ?? "Sistema"}</span>
                        <span className={`font-medium ${actionCfg.color}`}>{actionCfg.label}</span>
                        <span className="text-muted-foreground">{logEntry.entity}</span>
                        {logEntry.entityId && (
                          <span className="text-muted-foreground text-xs">#{logEntry.entityId}</span>
                        )}
                      </div>
                      {logEntry.details && (
                        <p className="text-xs text-muted-foreground mt-0.5 break-all">{logEntry.details}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {logEntry.createdAt ? format(new Date(logEntry.createdAt), "dd MMM, HH:mm", { locale: pt }) : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
