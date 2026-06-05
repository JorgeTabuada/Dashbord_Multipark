import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Droplets,
  Users,
  Euro,
  Clock,
  CalendarDays,
  Plus,
  Home,
  Trash2,
} from "lucide-react";

const LEVELS = [
  { id: "junior", label: "Júnior", hourlyRate: 4 },
  { id: "senior", label: "Sénior", hourlyRate: 5 },
  { id: "terminal", label: "Terminal", hourlyRate: 5.5 },
  { id: "master", label: "Master", hourlyRate: 6 },
] as const;
type LevelId = (typeof LEVELS)[number]["id"];

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const HOURS_25 = Array.from({ length: 25 }, (_, i) => i);

const fmtEur = (n: number) =>
  n.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
const fmtHour = (h: number) => `${String(h).padStart(2, "0")}h`;
const fmtDate = (s: string) => {
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long" });
};

function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function ExtrasDiaPage() {
  const [baseDate, setBaseDate] = useState(todayISO());

  const { data, isLoading, error } = trpc.extrasDia.forecast.useQuery({ baseDate });

  const peakHour = useMemo(() => {
    if (!data) return null;
    let max = 0;
    let hour = -1;
    for (const row of data.hourly) {
      const total = row.checkins + row.checkouts;
      if (total > max) {
        max = total;
        hour = row.hour;
      }
    }
    return hour >= 0 ? { hour, total: max } : null;
  }, [data]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-blue-600" />
            Extras Dia — Previsão Lisboa
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Planeamento de chegadas, saídas, lavagens e condutores para o dia seguinte.
          </p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="baseDate" className="text-xs">Data base</Label>
          <Input
            id="baseDate"
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">A carregar previsão...</div>
      )}
      {error && (
        <div className="text-sm text-red-600">Erro: {error.message}</div>
      )}

      {data && (
        <>
          <div className="text-sm text-muted-foreground">
            A mostrar previsão para <strong>{fmtDate(data.targetDate)}</strong>
            {peakHour && (
              <span className="ml-2">
                · Hora de pico: <strong>{fmtHour(peakHour.hour)}</strong> ({peakHour.total} operações)
              </span>
            )}
            <span className="ml-2">
              · Parques: <strong>{data.parksQueried.length}</strong>
            </span>
          </div>

          {data.parksFailed.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50/60 p-3 text-xs">
              <div className="font-medium mb-1">Avisos ({data.parksFailed.length})</div>
              <ul className="space-y-0.5 text-amber-900">
                {data.parksFailed.slice(0, 5).map((f, i) => (
                  <li key={i}>
                    <span className="font-mono">{f.park}</span>: {f.error}
                  </li>
                ))}
                {data.parksFailed.length > 5 && (
                  <li>... e mais {data.parksFailed.length - 5}</li>
                )}
              </ul>
            </div>
          )}

          {data.parksQueried.length === 0 && (
            <div className="rounded-md border border-red-300 bg-red-50/60 p-3 text-sm">
              Nenhuma chave de API Lisboa configurada. Define{" "}
              <code className="font-mono">MULTIPARK_API_KEY_LISBON_*</code> nas env vars.
            </div>
          )}

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              icon={<ArrowDownToLine className="h-4 w-4 text-emerald-600" />}
              label="Chegadas"
              value={data.totals.checkins}
            />
            <KpiCard
              icon={<ArrowUpFromLine className="h-4 w-4 text-orange-600" />}
              label="Saídas"
              value={data.totals.checkouts}
            />
            <KpiCard
              icon={<Users className="h-4 w-4 text-blue-600" />}
              label="Condutores (pico)"
              value={data.allocation.cheapest.peakDrivers}
              hint={`${data.allocation.cheapest.totalDriverHours}h totais`}
            />
            <KpiCard
              icon={<Euro className="h-4 w-4 text-purple-600" />}
              label="Custo mínimo (Júnior)"
              value={fmtEur(data.allocation.cheapest.totalCost)}
            />
          </div>

          {/* Hourly table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Por hora — {fmtDate(data.targetDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-muted-foreground">
                      <th className="text-left py-2 px-2">Hora</th>
                      <th className="text-right py-2 px-2">Chegadas</th>
                      <th className="text-right py-2 px-2">Saídas</th>
                      <th className="text-right py-2 px-2">Total</th>
                      <th className="text-right py-2 px-2">Condutores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.hourly
                      .filter(h => h.checkins + h.checkouts > 0)
                      .map(row => {
                        const total = row.checkins + row.checkouts;
                        const isPeak = peakHour?.hour === row.hour;
                        return (
                          <tr
                            key={row.hour}
                            className={`border-b hover:bg-muted/40 ${isPeak ? "bg-blue-50/50" : ""}`}
                          >
                            <td className="py-1.5 px-2 font-mono">{fmtHour(row.hour)}</td>
                            <td className="py-1.5 px-2 text-right text-emerald-700">
                              {row.checkins || ""}
                            </td>
                            <td className="py-1.5 px-2 text-right text-orange-700">
                              {row.checkouts || ""}
                            </td>
                            <td className="py-1.5 px-2 text-right font-semibold">{total}</td>
                            <td className="py-1.5 px-2 text-right">
                              <Badge variant="secondary">{row.driversNeeded}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    {data.hourly.every(h => h.checkins + h.checkouts === 0) && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted-foreground">
                          Sem operações previstas neste dia.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Lavagens */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="h-4 w-4 text-cyan-600" />
                Lavagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <WashTile
                  title="Saídas hoje com lavagem"
                  date={data.washes.base.date}
                  count={data.washes.base.exitsWithWash}
                />
                <WashTile
                  title="Saídas amanhã com lavagem"
                  date={data.washes.target.date}
                  count={data.washes.target.exitsWithWash}
                  highlight
                />
                <WashTile
                  title="Saídas depois de amanhã"
                  date={data.washes.next.date}
                  count={data.washes.next.exitsWithWash}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Lavagens não consomem condutores. Os carros listados em "amanhã" / "depois de
                amanhã" precisam de ser lavados antes da entrega.
              </p>
            </CardContent>
          </Card>

          {/* Driver allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Condutores sugeridos (3 carros/hora · turnos 3–12h)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-2">Turnos propostos (Júnior — mais barato)</h3>
                {data.allocation.cheapest.shifts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem turnos necessários.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-xs uppercase text-muted-foreground">
                          <th className="text-left py-2 px-2">#</th>
                          <th className="text-left py-2 px-2">Tipo</th>
                          <th className="text-right py-2 px-2">Início</th>
                          <th className="text-right py-2 px-2">Fim</th>
                          <th className="text-right py-2 px-2">Horas</th>
                          <th className="text-right py-2 px-2">€/h</th>
                          <th className="text-right py-2 px-2">Custo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.allocation.cheapest.shifts.map((s, i) => (
                          <tr key={i} className="border-b">
                            <td className="py-1.5 px-2 text-muted-foreground">{i + 1}</td>
                            <td className="py-1.5 px-2">{s.label}</td>
                            <td className="py-1.5 px-2 text-right font-mono">{fmtHour(s.startHour)}</td>
                            <td className="py-1.5 px-2 text-right font-mono">{fmtHour(s.endHour)}</td>
                            <td className="py-1.5 px-2 text-right">{s.hours}h</td>
                            <td className="py-1.5 px-2 text-right">{fmtEur(s.hourlyRate)}</td>
                            <td className="py-1.5 px-2 text-right font-semibold">{fmtEur(s.cost)}</td>
                          </tr>
                        ))}
                        <tr className="font-semibold bg-muted/40">
                          <td colSpan={4} className="py-2 px-2 text-right">Total</td>
                          <td className="py-2 px-2 text-right">{data.allocation.cheapest.totalDriverHours}h</td>
                          <td></td>
                          <td className="py-2 px-2 text-right">{fmtEur(data.allocation.cheapest.totalCost)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium text-sm mb-2">Comparação por nível</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {data.allocation.bySingleLevel.map(l => (
                    <div
                      key={l.level}
                      className="border rounded-md p-3 bg-card"
                    >
                      <div className="text-xs text-muted-foreground">{l.label}</div>
                      <div className="text-lg font-semibold">{fmtEur(l.totalCost)}</div>
                      <div className="text-xs text-muted-foreground">{l.totalHours}h totais</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <TeamSection targetDate={data.targetDate} />
        </>
      )}
    </div>
  );
}

// ─── Equipa do dia (atribuições) ───────────────────────────────────────────────

function TeamSection({ targetDate }: { targetDate: string }) {
  const utils = trpc.useUtils();
  const assignmentsQuery = trpc.extrasDia.assignments.useQuery({ date: targetDate });
  const candidatesQuery = trpc.extrasDia.candidates.useQuery();

  const upsert = trpc.extrasDia.upsertAssignment.useMutation({
    onSuccess: () => {
      utils.extrasDia.assignments.invalidate({ date: targetDate });
      toast.success("Turno guardado");
    },
    onError: (e) => toast.error(e.message),
  });
  const del = trpc.extrasDia.deleteAssignment.useMutation({
    onSuccess: () => {
      utils.extrasDia.assignments.invalidate({ date: targetDate });
      toast.success("Turno removido");
    },
    onError: (e) => toast.error(e.message),
  });

  const assignments = assignmentsQuery.data ?? [];
  const candidates = candidatesQuery.data ?? [];

  const totalCost = assignments.reduce((s, a) => s + a.cost, 0);
  const totalHours = assignments.reduce((s, a) => s + a.hoursBilled, 0);

  const [adding, setAdding] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Equipa do dia — {fmtDate(targetDate)}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Atribui pessoas, edita horários e "manda para casa" quando não há trabalho.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Custo escalado</div>
              <div className="text-lg font-bold">{fmtEur(totalCost)}</div>
              <div className="text-xs text-muted-foreground">{totalHours}h pagas</div>
            </div>
            <Button size="sm" variant="default" onClick={() => setAdding(v => !v)}>
              <Plus className="h-4 w-4 mr-1" /> {adding ? "Cancelar" : "Adicionar"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <AssignmentForm
            targetDate={targetDate}
            candidates={candidates}
            onSubmit={async (values) => {
              await upsert.mutateAsync(values);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
            submitting={upsert.isPending}
          />
        )}

        {assignmentsQuery.isLoading && (
          <div className="text-sm text-muted-foreground">A carregar...</div>
        )}

        {!assignmentsQuery.isLoading && assignments.length === 0 && !adding && (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma pessoa escalada. Clica em "Adicionar" para começar.
          </div>
        )}

        {assignments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="text-left py-2 px-2">Pessoa</th>
                  <th className="text-left py-2 px-2">Nível</th>
                  <th className="text-right py-2 px-2">Início</th>
                  <th className="text-right py-2 px-2">Fim</th>
                  <th className="text-right py-2 px-2">Mandado p/ casa</th>
                  <th className="text-right py-2 px-2">Horas pagas</th>
                  <th className="text-right py-2 px-2">Custo</th>
                  <th className="text-right py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <AssignmentRow
                    key={a.id}
                    assignment={a}
                    onSave={(payload) => upsert.mutate({ ...payload, id: a.id })}
                    onDelete={() => del.mutate({ id: a.id })}
                    busy={upsert.isPending || del.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AssignmentFormValues {
  assignmentDate: string;
  employeeId: number | null;
  personName: string;
  level: LevelId;
  startHour: number;
  endHour: number;
  sentHomeHour: number | null;
}

function AssignmentForm({
  targetDate,
  candidates,
  onSubmit,
  onCancel,
  submitting,
}: {
  targetDate: string;
  candidates: { id: number; fullName: string; suggestedLevel: LevelId }[];
  onSubmit: (values: AssignmentFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [personName, setPersonName] = useState("");
  const [level, setLevel] = useState<LevelId>("junior");
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(13);

  const span = endHour - startHour;
  const rate = LEVELS.find(l => l.id === level)?.hourlyRate ?? 0;
  const previewCost = Math.max(0, span) * rate;
  const valid = personName.trim().length > 0 && span >= 3 && span <= 12;

  return (
    <div className="border rounded-md p-3 bg-muted/30 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Empregado (RH)</Label>
          <Select
            value={employeeId ? String(employeeId) : "none"}
            onValueChange={(v) => {
              if (v === "none") {
                setEmployeeId(null);
                return;
              }
              const id = parseInt(v, 10);
              const c = candidates.find(c => c.id === id);
              if (c) {
                setEmployeeId(id);
                setPersonName(c.fullName);
                setLevel(c.suggestedLevel);
              }
            }}
          >
            <SelectTrigger><SelectValue placeholder="Escolher..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Nenhum (escrever nome) —</SelectItem>
              {candidates.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Nome</Label>
          <Input
            value={personName}
            onChange={e => setPersonName(e.target.value)}
            placeholder="Nome da pessoa"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Nível</Label>
          <Select value={level} onValueChange={v => setLevel(v as LevelId)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEVELS.map(l => (
                <SelectItem key={l.id} value={l.id}>
                  {l.label} ({fmtEur(l.hourlyRate)}/h)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Início</Label>
          <Select value={String(startHour)} onValueChange={v => setStartHour(parseInt(v, 10))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {HOURS_24.map(h => (
                <SelectItem key={h} value={String(h)}>{fmtHour(h)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Fim</Label>
          <Select value={String(endHour)} onValueChange={v => setEndHour(parseInt(v, 10))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {HOURS_25.map(h => (
                <SelectItem key={h} value={String(h)}>{fmtHour(h)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm">
          <div className="text-xs text-muted-foreground">Pré-visualização</div>
          <div className="font-semibold">
            {span}h × {fmtEur(rate)} = {fmtEur(previewCost)}
          </div>
          {span < 3 && <div className="text-xs text-red-600">Mínimo 3h</div>}
          {span > 12 && <div className="text-xs text-red-600">Máximo 12h</div>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} size="sm">Cancelar</Button>
        <Button
          size="sm"
          disabled={!valid || submitting}
          onClick={() => onSubmit({
            assignmentDate: targetDate,
            employeeId,
            personName: personName.trim(),
            level,
            startHour,
            endHour,
            sentHomeHour: null,
          })}
        >
          Adicionar
        </Button>
      </div>
    </div>
  );
}

function AssignmentRow({
  assignment,
  onSave,
  onDelete,
  busy,
}: {
  assignment: {
    id: number;
    assignmentDate: string;
    employeeId: number | null;
    personName: string;
    level: LevelId;
    startHour: number;
    endHour: number;
    sentHomeHour: number | null;
    notes: string | null;
    hoursBilled: number;
    cost: number;
  };
  onSave: (payload: AssignmentFormValues) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const a = assignment;
  const [editing, setEditing] = useState(false);
  const [level, setLevel] = useState<LevelId>(a.level);
  const [startHour, setStartHour] = useState(a.startHour);
  const [endHour, setEndHour] = useState(a.endHour);
  const [sentHomeHour, setSentHomeHour] = useState<number | null>(a.sentHomeHour);

  const span = (sentHomeHour ?? endHour) - startHour;
  const rate = LEVELS.find(l => l.id === level)?.hourlyRate ?? 0;
  const computedCost = Math.max(0, span) * rate;

  if (!editing) {
    return (
      <tr className="border-b hover:bg-muted/30">
        <td className="py-2 px-2">{a.personName}</td>
        <td className="py-2 px-2">
          <Badge variant="secondary">{LEVELS.find(l => l.id === a.level)?.label}</Badge>
        </td>
        <td className="py-2 px-2 text-right font-mono">{fmtHour(a.startHour)}</td>
        <td className="py-2 px-2 text-right font-mono">{fmtHour(a.endHour)}</td>
        <td className="py-2 px-2 text-right font-mono">
          {a.sentHomeHour != null ? fmtHour(a.sentHomeHour) : "—"}
        </td>
        <td className="py-2 px-2 text-right">{a.hoursBilled}h</td>
        <td className="py-2 px-2 text-right font-semibold">{fmtEur(a.cost)}</td>
        <td className="py-2 px-2 text-right">
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Editar</Button>
            <Button size="sm" variant="ghost" onClick={onDelete} disabled={busy}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b bg-muted/20">
      <td className="py-2 px-2">{a.personName}</td>
      <td className="py-2 px-2">
        <Select value={level} onValueChange={v => setLevel(v as LevelId)}>
          <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            {LEVELS.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 px-2 text-right">
        <Select value={String(startHour)} onValueChange={v => setStartHour(parseInt(v, 10))}>
          <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
          <SelectContent>
            {HOURS_24.map(h => <SelectItem key={h} value={String(h)}>{fmtHour(h)}</SelectItem>)}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 px-2 text-right">
        <Select value={String(endHour)} onValueChange={v => setEndHour(parseInt(v, 10))}>
          <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
          <SelectContent>
            {HOURS_25.map(h => <SelectItem key={h} value={String(h)}>{fmtHour(h)}</SelectItem>)}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 px-2 text-right">
        <Select
          value={sentHomeHour == null ? "none" : String(sentHomeHour)}
          onValueChange={v => setSentHomeHour(v === "none" ? null : parseInt(v, 10))}
        >
          <SelectTrigger className="h-8 w-24"><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— Não —</SelectItem>
            {HOURS_25
              .filter(h => h >= startHour && h <= endHour)
              .map(h => (
                <SelectItem key={h} value={String(h)}>
                  <span className="flex items-center gap-1"><Home className="h-3 w-3" />{fmtHour(h)}</span>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 px-2 text-right">{Math.max(0, span)}h</td>
      <td className="py-2 px-2 text-right font-semibold">{fmtEur(computedCost)}</td>
      <td className="py-2 px-2 text-right">
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            disabled={busy || endHour - startHour < 3 || endHour - startHour > 12}
            onClick={() => {
              onSave({
                assignmentDate: a.assignmentDate,
                employeeId: a.employeeId,
                personName: a.personName,
                level,
                startHour,
                endHour,
                sentHomeHour,
              });
              setEditing(false);
            }}
          >
            Guardar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
        </div>
      </td>
    </tr>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function WashTile({
  title,
  date,
  count,
  highlight,
}: {
  title: string;
  date: string;
  count: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-md p-3 ${
        highlight ? "bg-cyan-50/60 border-cyan-200" : "bg-card"
      }`}
    >
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{fmtDate(date)}</div>
      <div className="text-2xl font-bold mt-1">{count}</div>
    </div>
  );
}
