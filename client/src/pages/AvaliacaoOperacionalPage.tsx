import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ClipboardList, Download, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";

const fmtHour = (h: number) => {
  if (h < 24) return `${String(h).padStart(2, "0")}h`;
  return `${String(h - 24).padStart(2, "0")}h+1`;
};

function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function AvaliacaoOperacionalPage() {
  const [date, setDate] = useState(todayISO());

  const assignmentsQ = trpc.extrasDia.assignments.useQuery({ date });
  const assignments = assignmentsQ.data ?? [];

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-purple-600" />
            Avaliação Operacional
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Equipa de extras escalados para o dia + histórico de actividade na API Multipark.
          </p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="date" className="text-xs">Dia</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {assignmentsQ.isLoading && (
        <p className="text-sm text-muted-foreground">A carregar equipa...</p>
      )}

      {!assignmentsQ.isLoading && assignments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Sem extras escalados para {date}. Vai a /extras-dia, escolhe este dia e adiciona equipa.
          </CardContent>
        </Card>
      )}

      {assignments.length > 0 && (
        <BulkActions date={date} agents={assignments.map(a => a.personName)} />
      )}

      <div className="grid gap-3">
        {assignments.map(a => (
          <AgentCard key={a.id} assignment={a} date={date} />
        ))}
      </div>
    </div>
  );
}

function BulkActions({ date, agents }: { date: string; agents: string[] }) {
  const fetchMut = trpc.multipark.fetchAgentHistory.useMutation();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const runAll = async () => {
    setRunning(true);
    setProgress({ done: 0, total: agents.length });
    let total = 0;
    for (const name of agents) {
      try {
        const r = await fetchMut.mutateAsync({ agentName: name, date });
        total += r.totalEntries;
      } catch {}
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setRunning(false);
    toast.success(`Concluído. Total de ${total} entries para ${agents.length} agentes.`);
  };

  return (
    <Card className="bg-purple-50/40 border-purple-200">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="font-medium">Buscar histórico de TODOS</div>
          <p className="text-xs text-muted-foreground">
            Chama /agent/history na Multipark para cada nome, em todos os parques configurados.
          </p>
          {running && progress.total > 0 && (
            <p className="text-xs text-purple-700 mt-1">
              {progress.done}/{progress.total} agentes processados...
            </p>
          )}
        </div>
        <Button onClick={runAll} disabled={running}>
          {running ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Buscar todos ({agents.length})
        </Button>
      </CardContent>
    </Card>
  );
}

function AgentCard({ assignment, date }: { assignment: any; date: string }) {
  const [expanded, setExpanded] = useState(false);
  const fetchMut = trpc.multipark.fetchAgentHistory.useMutation();
  const summaryQ = trpc.multipark.agentHistorySummary.useQuery(
    { agentName: assignment.personName, date },
    { enabled: expanded },
  );

  const handleFetch = async () => {
    try {
      const r = await fetchMut.mutateAsync({
        agentName: assignment.personName,
        date,
      });
      toast.success(
        `${assignment.personName}: ${r.totalEntries} entries em ${r.parks} parques`,
      );
      summaryQ.refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Erro");
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <div className="min-w-0">
              <div className="font-semibold flex items-center gap-2">
                {assignment.personName}
                {assignment.isTeamLeader && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">TL</Badge>
                )}
                {assignment.shift && (
                  <Badge variant="outline" className="text-[10px]">
                    {assignment.shift === "morning" ? "Manhã" : "Noite"}
                  </Badge>
                )}
                {!assignment.isTeamLeader && assignment.level && (
                  <Badge variant="secondary" className="text-[10px]">{assignment.level}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {fmtHour(assignment.startHour)}–{fmtHour(assignment.sentHomeHour ?? assignment.endHour)}
                {" · "}{assignment.hoursBilled}h pagas
                {" · "}€{assignment.cost.toFixed(2)}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleFetch} disabled={fetchMut.isPending}>
            {fetchMut.isPending ? (
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Download className="w-3 h-3 mr-1" />
            )}
            Buscar histórico
          </Button>
        </div>

        {expanded && (
          <div className="border-t pt-2 mt-2 text-xs">
            {summaryQ.isLoading && <p className="text-muted-foreground">A carregar...</p>}
            {summaryQ.data && (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline">{summaryQ.data.total} entradas</Badge>
                  {Object.entries(summaryQ.data.byType).map(([k, v]) => (
                    <Badge key={k} variant="secondary">{k}: {v}</Badge>
                  ))}
                </div>
                {summaryQ.data.total === 0 ? (
                  <p className="text-muted-foreground">
                    Sem registos. Clica "Buscar histórico" para ir buscar à API.
                  </p>
                ) : (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-[10px] uppercase text-muted-foreground border-b">
                          <th className="text-left py-1 px-2">Hora</th>
                          <th className="text-left py-1 px-2">Acção</th>
                          <th className="text-left py-1 px-2">Reserva</th>
                          <th className="text-left py-1 px-2">Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryQ.data.items.map((it: any) => (
                          <tr key={it.id} className="border-b hover:bg-muted/40">
                            <td className="py-1 px-2 font-mono">
                              {it.actionTime ? new Date(it.actionTime).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : "—"}
                            </td>
                            <td className="py-1 px-2">
                              <Badge variant="outline" className="text-[10px]">{it.changeType ?? "?"}</Badge>
                            </td>
                            <td className="py-1 px-2 font-mono text-[10px] text-muted-foreground">
                              {it.bookingExternalId.slice(0, 16)}…
                            </td>
                            <td className="py-1 px-2 text-muted-foreground">
                              {it.remarks ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
