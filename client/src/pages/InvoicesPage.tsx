import { trpc } from "@/lib/trpc";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import {
  Euro, TrendingUp, TrendingDown, Receipt, Truck, CalendarClock,
  Building2, FolderTree, FileText, Users as UsersIcon, Megaphone, Handshake,
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from "recharts";

const fmt = (v: number | string) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Number.isFinite(n) ? n : 0);
};

const compact = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return v.toFixed(0);
};

type Granularity = "day" | "week" | "month" | "year";

const QUICK_RANGES: Array<{ id: string; label: string; gran: Granularity; calc: () => [string, string] }> = [
  {
    id: "today", label: "Hoje", gran: "day", calc: () => {
      const d = new Date().toISOString().slice(0, 10);
      return [d, d];
    },
  },
  {
    id: "week", label: "Semana", gran: "day", calc: () => {
      const d = new Date();
      const day = (d.getDay() + 6) % 7; // segunda = 0
      const start = new Date(d); start.setDate(d.getDate() - day);
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
    },
  },
  {
    id: "month", label: "Mês", gran: "day", calc: () => {
      const d = new Date();
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
    },
  },
  {
    id: "ytd", label: "Ano (YTD)", gran: "month", calc: () => {
      const d = new Date();
      return [`${d.getFullYear()}-01-01`, d.toISOString().slice(0, 10)];
    },
  },
  {
    id: "year", label: "Ano completo", gran: "month", calc: () => {
      const d = new Date();
      return [`${d.getFullYear()}-01-01`, `${d.getFullYear()}-12-31`];
    },
  },
];

export default function InvoicesPage() {
  const filters = useGlobalFilters();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(monthEnd);
  const [granularity, setGranularity] = useState<Granularity>("day");

  const projectId = useMemo(() => {
    if (filters.brandId !== null) return filters.brandId;
    if (filters.cityId !== null) return filters.cityId;
    return undefined;
  }, [filters.cityId, filters.brandId]);

  const { data, isLoading } = trpc.invoices.billing.useQuery({ from, to, projectId, granularity });

  const summary = data?.summary;
  const timeseries = data?.timeseries ?? [];
  const deliveries = data?.deliveries ?? [];
  const expensesPaid = data?.expensesPaid ?? [];
  const expensesPending = data?.expensesPending ?? [];
  const forecast = data?.forecast ?? [];
  const invoiced = (data as any)?.invoices ?? [];
  const extrasDia = (data as any)?.extrasDia ?? [];
  const marketing = (data as any)?.marketing ?? { expenses: [], ads: [] };
  const salesCommissions: Array<{ partnerName: string | null; projectName: string | null; bookingsCount: number; revenueGross: number; commissionRate: number; commission: number }> = (data as any)?.salesCommissions ?? [];
  const operationalPartners: Array<{ partnerName: string | null; projectName: string | null; amount: number; status: string; sentAt: string | null }> = (data as any)?.operationalPartners ?? [];
  const salaries: { byProject: Array<{ projectName: string | null; cost: number }>; total: number } = (data as any)?.salaries ?? { byProject: [], total: 0 };

  const chartData = useMemo(() => timeseries.map((p: any) => ({
    bucket: p.bucket,
    produced: Number(p.produced ?? 0),
    invoiced: Number(p.invoiced ?? 0),
    expensesPaid: Number(p.expensesPaid ?? 0),
    marketingCost: Number(p.marketingCost ?? 0),
    revenueForecast: Number(p.revenueForecast ?? 0),
    margin: Number(p.produced ?? 0) - Number(p.expensesPaid ?? 0) - Number(p.marketingCost ?? 0),
  })), [timeseries]);

  // Despesas pagas por projeto (agrupado)
  const expPaidByProject = useMemo(() => {
    const map = new Map<string, { projectName: string; total: number; categories: { name: string; total: number }[] }>();
    for (const e of expensesPaid) {
      const key = e.projectName ?? "Sem projeto";
      if (!map.has(key)) map.set(key, { projectName: key, total: 0, categories: [] });
      const entry = map.get(key)!;
      entry.total += Number(e.totalAmount);
      entry.categories.push({ name: e.categoryName ?? "Sem categoria", total: Number(e.totalAmount) });
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [expensesPaid]);

  const expPendByProject = useMemo(() => {
    const map = new Map<string, { projectName: string; total: number; items: { supplier: string; category: string; total: number }[] }>();
    for (const e of expensesPending) {
      const key = e.projectName ?? "Sem projeto";
      if (!map.has(key)) map.set(key, { projectName: key, total: 0, items: [] });
      const entry = map.get(key)!;
      entry.total += Number(e.totalAmount);
      entry.items.push({ supplier: e.supplier ?? "—", category: e.categoryName ?? "Sem categoria", total: Number(e.totalAmount) });
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [expensesPending]);

  function applyRange(r: typeof QUICK_RANGES[0]) {
    const [f, t] = r.calc();
    setFrom(f); setTo(t); setGranularity(r.gran);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-muted-foreground text-sm">
            Receita produzida (operacional) vs faturada (administrativo) e todos os custos do período — pagos e por pagar.
          </p>
        </div>
        <div className="flex items-end gap-2 flex-wrap">
          {QUICK_RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => applyRange(r)}
              className="text-xs px-2.5 py-1.5 rounded border bg-muted/40 hover:bg-muted transition-colors"
            >
              {r.label}
            </button>
          ))}
          <div>
            <Label className="text-xs mb-1 block">De</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[140px] h-9" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[140px] h-9" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Granularidade</Label>
            <Select value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
              <SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="year">Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading || !summary ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* KPI Cards principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              icon={<Truck className="w-4 h-4 text-emerald-600" />}
              label="Produzido"
              value={fmt(summary.produced)}
              hint="Reservas com check-out no período"
              color="text-emerald-700"
            />
            <KpiCard
              icon={<FileText className="w-4 h-4 text-indigo-600" />}
              label="Faturado"
              value={fmt(summary.invoiced)}
              hint="Faturas emitidas no período"
              color="text-indigo-700"
            />
            <KpiCard
              icon={<Receipt className="w-4 h-4 text-red-600" />}
              label="Custos totais"
              value={fmt(summary.totalCostsAll)}
              hint={`Pagos: ${fmt(summary.totalCostsPaid)} · Pendentes: ${fmt(summary.totalCostsAll - summary.totalCostsPaid)}`}
              color="text-red-700"
            />
            <KpiCard
              icon={summary.marginRealized >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
              label="Margem"
              value={fmt(summary.marginRealized)}
              hint={`Produzido − custos pagos · ${summary.produced > 0 ? ((summary.marginRealized / summary.produced) * 100).toFixed(1) : "0"}%`}
              color={summary.marginRealized >= 0 ? "text-emerald-700" : "text-red-700"}
            />
          </div>

          {/* KPI secundários: detalhe dos custos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiSmall icon={<Receipt className="w-3.5 h-3.5 text-red-500" />} label="Despesas pagas" value={fmt(summary.expensesPaid)} />
            <KpiSmall icon={<UsersIcon className="w-3.5 h-3.5 text-amber-500" />} label="Equipa do dia" value={fmt(summary.extrasDiaCost)} />
            <KpiSmall icon={<UsersIcon className="w-3.5 h-3.5 text-blue-500" />} label="Salários" value={fmt((summary as any).salariesCost ?? 0)} />
            <KpiSmall icon={<Megaphone className="w-3.5 h-3.5 text-violet-500" />} label="Marketing" value={fmt(summary.marketingCost)} />
            <KpiSmall icon={<Handshake className="w-3.5 h-3.5 text-rose-500" />} label="Comissão venda" value={fmt((summary as any).salesCommissions ?? 0)} />
            <KpiSmall icon={<Handshake className="w-3.5 h-3.5 text-cyan-500" />} label="Parceiros op." value={fmt((summary as any).operationalPartnersPaid ?? summary.partnerCommissionsPaid)} />
          </div>

          {/* Gráfico timeseries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                Evolução por {granularity === "day" ? "dia" : granularity === "week" ? "semana" : granularity === "month" ? "mês" : "ano"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-10">Sem dados no período</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={compact} />
                    <Tooltip
                      formatter={(v: any, name: string) => [fmt(Number(v)), name]}
                      contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="produced" name="Produzido" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="expensesPaid" name="Despesas" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="marketingCost" name="Marketing" fill="#a78bfa" radius={[3, 3, 0, 0]} />
                    <Line dataKey="invoiced" name="Faturado" stroke="#6366f1" strokeWidth={2} dot={false} />
                    <Line dataKey="revenueForecast" name="Receita prevista" stroke="#0ea5e9" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                    <Line dataKey="margin" name="Margem" stroke="#111827" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tabs com detalhes */}
          <Tabs defaultValue="real" className="space-y-4">
            <TabsList>
              <TabsTrigger value="real">Realizado</TabsTrigger>
              <TabsTrigger value="costs">Custos detalhados</TabsTrigger>
              <TabsTrigger value="forecast">Previsão</TabsTrigger>
            </TabsList>

            <TabsContent value="real" className="space-y-4">
              {/* Produzido por projeto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Produzido por projeto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deliveries.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">Sem produção no período</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-2">Projeto</th>
                          <th className="p-2 text-right">Entregas</th>
                          <th className="p-2 text-right">Parking</th>
                          <th className="p-2 text-right">Delivery</th>
                          <th className="p-2 text-right">Extras</th>
                          <th className="p-2 text-right font-bold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveries.map((d, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="p-2 flex items-center gap-2"><FolderTree className="w-3 h-3 text-muted-foreground" />{d.projectName ?? "Sem projeto"}</td>
                            <td className="p-2 text-right tabular-nums">{d.count}</td>
                            <td className="p-2 text-right tabular-nums">{fmt(Number(d.parkingRevenue))}</td>
                            <td className="p-2 text-right tabular-nums">{fmt(Number(d.deliveryCharges))}</td>
                            <td className="p-2 text-right tabular-nums">{fmt(Number(d.extrasRevenue))}</td>
                            <td className="p-2 text-right tabular-nums font-bold">{fmt(Number(d.totalRevenue))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Faturado por projeto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Faturado por projeto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {invoiced.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">Sem faturas emitidas no período</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-2">Projeto</th>
                          <th className="p-2 text-right">Nº faturas</th>
                          <th className="p-2 text-right">Pago</th>
                          <th className="p-2 text-right font-bold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiced.map((inv: any, i: number) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="p-2">{inv.projectName ?? "Sem projeto"}</td>
                            <td className="p-2 text-right tabular-nums">{inv.count}</td>
                            <td className="p-2 text-right tabular-nums text-emerald-700">{fmt(Number(inv.paidAmount))}</td>
                            <td className="p-2 text-right tabular-nums font-bold">{fmt(Number(inv.totalAmount))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              {/* Despesas pagas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="w-4 h-4" /> Despesas pagas por projeto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expPaidByProject.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">Sem despesas pagas no período</p>
                  ) : (
                    <div className="space-y-3">
                      {expPaidByProject.map((p) => (
                        <div key={p.projectName} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" />{p.projectName}</span>
                            <span className="font-bold text-red-700">{fmt(p.total)}</span>
                          </div>
                          <div className="space-y-1">
                            {p.categories.map((c, i) => (
                              <div key={i} className="flex justify-between text-sm text-muted-foreground">
                                <span>{c.name}</span>
                                <span className="tabular-nums">{fmt(c.total)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Extras-dia */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" /> Equipa do dia (extras-dia)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {extrasDia.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">Sem escalas extras-dia no período</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-2">Nível</th>
                          <th className="p-2 text-right">Pessoas</th>
                          <th className="p-2 text-right">Horas</th>
                          <th className="p-2 text-right font-bold">Custo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extrasDia.map((e: any, i: number) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="p-2 capitalize">{e.level}</td>
                            <td className="p-2 text-right tabular-nums">{e.headcount}</td>
                            <td className="p-2 text-right tabular-nums">{Number(e.hours).toFixed(1)}h</td>
                            <td className="p-2 text-right tabular-nums font-bold text-amber-700">{fmt(e.cost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Marketing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Megaphone className="w-4 h-4" /> Marketing (despesas + ads)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {marketing.expenses.length === 0 && marketing.ads.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">Sem gastos de marketing no período</p>
                  ) : (
                    <>
                      {marketing.expenses.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Despesas marketing</p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-left">
                                <th className="p-2">Projeto</th>
                                <th className="p-2">Categoria</th>
                                <th className="p-2 text-right">Registos</th>
                                <th className="p-2 text-right font-bold">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {marketing.expenses.map((m: any, i: number) => (
                                <tr key={i} className="border-b hover:bg-muted/50">
                                  <td className="p-2">{m.projectName ?? "Sem projeto"}</td>
                                  <td className="p-2 capitalize">{m.category}</td>
                                  <td className="p-2 text-right tabular-nums">{m.count}</td>
                                  <td className="p-2 text-right tabular-nums font-bold text-violet-700">{fmt(Number(m.totalAmount))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {marketing.ads.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Ad spend (Google/Meta)</p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-left">
                                <th className="p-2">Projeto</th>
                                <th className="p-2 text-right">Conversões</th>
                                <th className="p-2 text-right font-bold">Spend</th>
                              </tr>
                            </thead>
                            <tbody>
                              {marketing.ads.map((a: any, i: number) => (
                                <tr key={i} className="border-b hover:bg-muted/50">
                                  <td className="p-2">{a.projectName ?? "Sem projeto"}</td>
                                  <td className="p-2 text-right tabular-nums">{a.conversions}</td>
                                  <td className="p-2 text-right tabular-nums font-bold text-violet-700">{fmt(Number(a.totalSpend))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Salários por projeto (rateados ao dia) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" /> Salários por centro de custos
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Salário mensal × dias do período ({(summary as any).periodDays} dias). Quem está num nível superior
                    (Grupo / Cidade / Marca) tem o custo distribuído equitativamente pelas marcas folhas.
                  </p>
                </CardHeader>
                <CardContent>
                  {salaries.byProject.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">Sem salários no período</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-2">Centro de custos</th>
                          <th className="p-2 text-right font-bold">Custo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaries.byProject.map((s: any, i: number) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="p-2 flex items-center gap-2"><FolderTree className="w-3 h-3 text-muted-foreground" />{s.projectName ?? "Sem projeto"}</td>
                            <td className="p-2 text-right tabular-nums font-bold text-blue-700">{fmt(s.cost)}</td>
                          </tr>
                        ))}
                        <tr className="bg-muted/30 font-bold">
                          <td className="p-2">Total</td>
                          <td className="p-2 text-right">{fmt(salaries.total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Comissões parceiros de venda (calculadas via campaign matching) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Handshake className="w-4 h-4" /> Comissões a parceiros de venda
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Agências/parceiros com campanha — comissão = receita da reserva × <em>%</em>, atribuída à marca da reserva.
                  </p>
                </CardHeader>
                <CardContent>
                  {salesCommissions.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">Sem comissões de venda no período</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-2">Parceiro</th>
                          <th className="p-2">Marca / Projeto</th>
                          <th className="p-2 text-right">Reservas</th>
                          <th className="p-2 text-right">Receita</th>
                          <th className="p-2 text-right">%</th>
                          <th className="p-2 text-right font-bold">Comissão</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesCommissions.map((c, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="p-2">{c.partnerName ?? "—"}</td>
                            <td className="p-2 flex items-center gap-2"><FolderTree className="w-3 h-3 text-muted-foreground" />{c.projectName ?? "Sem projeto"}</td>
                            <td className="p-2 text-right tabular-nums">{c.bookingsCount}</td>
                            <td className="p-2 text-right tabular-nums">{fmt(c.revenueGross)}</td>
                            <td className="p-2 text-right tabular-nums">{c.commissionRate}%</td>
                            <td className="p-2 text-right tabular-nums font-bold text-rose-700">{fmt(c.commission)}</td>
                          </tr>
                        ))}
                        <tr className="bg-muted/30 font-bold">
                          <td className="p-2" colSpan={5}>Total</td>
                          <td className="p-2 text-right">{fmt(salesCommissions.reduce((s, c) => s + c.commission, 0))}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Parceiros operacionais (faturas) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Handshake className="w-4 h-4" /> Parceiros operacionais
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Ex.: Top Parking a operar marcas do Porto. Vem das partnership_invoices —
                    projeto inferido pelo nome do parceiro.
                  </p>
                </CardHeader>
                <CardContent>
                  {operationalPartners.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">Sem faturas operacionais no período</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-2">Parceiro</th>
                          <th className="p-2">Projeto inferido</th>
                          <th className="p-2">Estado</th>
                          <th className="p-2 text-right font-bold">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {operationalPartners.map((p, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="p-2">{p.partnerName ?? "—"}</td>
                            <td className="p-2">{p.projectName ?? <span className="text-muted-foreground text-xs">(não inferido)</span>}</td>
                            <td className="p-2"><Badge variant="outline" className="capitalize">{p.status}</Badge></td>
                            <td className="p-2 text-right tabular-nums font-bold text-cyan-700">{fmt(p.amount)}</td>
                          </tr>
                        ))}
                        <tr className="bg-muted/30 font-bold">
                          <td className="p-2" colSpan={3}>Total</td>
                          <td className="p-2 text-right">{fmt(operationalPartners.reduce((s, p) => s + p.amount, 0))}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forecast" className="space-y-4">
              {/* KPIs Previsão */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard
                  icon={<CalendarClock className="w-4 h-4 text-sky-600" />}
                  label="Receita prevista"
                  value={fmt(forecast.reduce((s, f) => s + Number(f.totalRevenue ?? 0), 0))}
                  hint={`${forecast.reduce((s, f) => s + Number(f.count ?? 0), 0)} reservas pendentes`}
                  color="text-sky-700"
                />
                <KpiCard
                  icon={<Receipt className="w-4 h-4 text-orange-600" />}
                  label="Despesas a pagar"
                  value={fmt(summary.expensesPending)}
                  hint={`${expensesPending.length} grupos`}
                  color="text-orange-700"
                />
                <KpiCard
                  icon={<Handshake className="w-4 h-4 text-blue-600" />}
                  label="Parceiros a pagar"
                  value={fmt(summary.partnerCommissionsPending)}
                  hint="Faturas sent/overdue/draft"
                  color="text-blue-700"
                />
                <KpiCard
                  icon={<Euro className="w-4 h-4 text-emerald-600" />}
                  label="Total estimado"
                  value={fmt(summary.produced + forecast.reduce((s, f) => s + Number(f.totalRevenue ?? 0), 0))}
                  hint="Realizado + previsto"
                  color="text-emerald-700"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarClock className="w-4 h-4" /> Receita prevista por projeto
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Reservas com check-in futuro, sem check-out e sem cancelamento</p>
                </CardHeader>
                <CardContent>
                  {forecast.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">Sem reservas pendentes no período</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-2">Projeto</th>
                          <th className="p-2 text-right">Reservas</th>
                          <th className="p-2 text-right font-bold">Receita prevista</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecast.map((f, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="p-2">{f.projectName ?? "Sem projeto"}</td>
                            <td className="p-2 text-right tabular-nums">{f.count}</td>
                            <td className="p-2 text-right tabular-nums font-bold">{fmt(Number(f.totalRevenue))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="w-4 h-4" /> Despesas a pagar por projeto
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Despesas pendentes com vencimento no período</p>
                </CardHeader>
                <CardContent>
                  {expPendByProject.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">Sem despesas pendentes no período</p>
                  ) : (
                    <div className="space-y-3">
                      {expPendByProject.map((p) => (
                        <div key={p.projectName} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" />{p.projectName}</span>
                            <span className="font-bold text-orange-700">{fmt(p.total)}</span>
                          </div>
                          <div className="space-y-1">
                            {p.items.map((it, i) => (
                              <div key={i} className="flex justify-between text-sm text-muted-foreground">
                                <span>{it.supplier} · {it.category}</span>
                                <span className="tabular-nums">{fmt(it.total)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, hint, color }: { icon: React.ReactNode; label: string; value: string; hint?: string; color?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color ?? ""}`}>{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </Card>
  );
}

function KpiSmall({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border rounded-lg px-3 py-2 bg-muted/30 flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
