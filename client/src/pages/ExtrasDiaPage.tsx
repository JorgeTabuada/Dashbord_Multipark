import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Droplets,
  Users,
  Euro,
  Clock,
  CalendarDays,
} from "lucide-react";

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
          </div>

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
        </>
      )}
    </div>
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
