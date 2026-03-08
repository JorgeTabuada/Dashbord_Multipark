import { trpc } from "@/lib/trpc";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import {
  Euro, TrendingUp, TrendingDown, Receipt, Truck, CalendarClock,
  Building2, FolderTree,
} from "lucide-react";

const fmt = (v: number | string) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(n);
};

export default function InvoicesPage() {
  const filters = useGlobalFilters();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(monthEnd);

  const projectId = useMemo(() => {
    if (filters.brandId !== null) return filters.brandId;
    if (filters.cityId !== null) return filters.cityId;
    return undefined;
  }, [filters.cityId, filters.brandId]);

  const { data, isLoading } = trpc.invoices.billing.useQuery({ from, to, projectId });

  const deliveries = data?.deliveries ?? [];
  const expensesPaid = data?.expensesPaid ?? [];
  const expensesPending = data?.expensesPending ?? [];
  const forecast = data?.forecast ?? [];

  // Totals
  const totalDeliveryRevenue = deliveries.reduce((s, d) => s + Number(d.totalRevenue), 0);
  const totalExpensesPaid = expensesPaid.reduce((s, e) => s + Number(e.totalAmount), 0);
  const totalExpensesPending = expensesPending.reduce((s, e) => s + Number(e.totalAmount), 0);
  const totalForecastRevenue = forecast.reduce((s, f) => s + Number(f.totalRevenue), 0);
  const margin = totalDeliveryRevenue - totalExpensesPaid;
  const forecastMargin = totalForecastRevenue - totalExpensesPending;

  // Group expenses paid by project
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

  // Group expenses pending by project
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-muted-foreground">Visão de receitas (entregas) e despesas por projeto</p>
        <div className="flex items-center gap-3">
          <div>
            <Label className="text-xs mb-1 block">De</Label>
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-[140px]" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Até</Label>
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-[140px]" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <Tabs defaultValue="real" className="space-y-4">
          <TabsList>
            <TabsTrigger value="real">Realizado</TabsTrigger>
            <TabsTrigger value="forecast">Previsão</TabsTrigger>
          </TabsList>

          {/* ─── ABA 1: REALIZADO ─── */}
          <TabsContent value="real" className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">Entregas (Receita)</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{fmt(totalDeliveryRevenue)}</p>
                <p className="text-xs text-muted-foreground">{deliveries.reduce((s, d) => s + Number(d.count), 0)} entregas</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-muted-foreground">Despesas Pagas</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{fmt(totalExpensesPaid)}</p>
                <p className="text-xs text-muted-foreground">{expensesPaid.reduce((s, e) => s + Number(e.count), 0)} registos</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {margin >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                  <span className="text-xs text-muted-foreground">Margem</span>
                </div>
                <p className={`text-2xl font-bold ${margin >= 0 ? "text-green-700" : "text-red-700"}`}>{fmt(margin)}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Euro className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">% Margem</span>
                </div>
                <p className="text-2xl font-bold">{totalDeliveryRevenue > 0 ? ((margin / totalDeliveryRevenue) * 100).toFixed(1) : "0"}%</p>
              </Card>
            </div>

            {/* Entregas por projeto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Entregas por Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deliveries.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">Sem entregas no período</p>
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
                          <td className="p-2 flex items-center gap-2">
                            <FolderTree className="w-3 h-3 text-muted-foreground" />
                            {d.projectName ?? "Sem projeto"}
                          </td>
                          <td className="p-2 text-right tabular-nums">{d.count}</td>
                          <td className="p-2 text-right tabular-nums">{fmt(Number(d.parkingRevenue))}</td>
                          <td className="p-2 text-right tabular-nums">{fmt(Number(d.deliveryCharges))}</td>
                          <td className="p-2 text-right tabular-nums">{fmt(Number(d.extrasRevenue))}</td>
                          <td className="p-2 text-right tabular-nums font-bold">{fmt(Number(d.totalRevenue))}</td>
                        </tr>
                      ))}
                      <tr className="bg-muted/30 font-bold">
                        <td className="p-2">Total</td>
                        <td className="p-2 text-right">{deliveries.reduce((s, d) => s + Number(d.count), 0)}</td>
                        <td className="p-2 text-right">{fmt(deliveries.reduce((s, d) => s + Number(d.parkingRevenue), 0))}</td>
                        <td className="p-2 text-right">{fmt(deliveries.reduce((s, d) => s + Number(d.deliveryCharges), 0))}</td>
                        <td className="p-2 text-right">{fmt(deliveries.reduce((s, d) => s + Number(d.extrasRevenue), 0))}</td>
                        <td className="p-2 text-right">{fmt(totalDeliveryRevenue)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* Despesas pagas por projeto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Despesas Pagas por Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expPaidByProject.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">Sem despesas pagas no período</p>
                ) : (
                  <div className="space-y-4">
                    {expPaidByProject.map((proj) => (
                      <div key={proj.projectName} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {proj.projectName}
                          </span>
                          <span className="font-bold text-red-700">{fmt(proj.total)}</span>
                        </div>
                        <div className="space-y-1">
                          {proj.categories.map((cat, i) => (
                            <div key={i} className="flex justify-between text-sm text-muted-foreground">
                              <span>{cat.name}</span>
                              <span className="tabular-nums">{fmt(cat.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total Despesas Pagas</span>
                      <span className="text-red-700">{fmt(totalExpensesPaid)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── ABA 2: PREVISÃO ─── */}
          <TabsContent value="forecast" className="space-y-6">
            {/* KPIs Previsão */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarClock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">Receita Prevista</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{fmt(totalForecastRevenue)}</p>
                <p className="text-xs text-muted-foreground">{forecast.reduce((s, f) => s + Number(f.count), 0)} reservas pendentes</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-muted-foreground">Despesas a Pagar</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">{fmt(totalExpensesPending)}</p>
                <p className="text-xs text-muted-foreground">{expensesPending.reduce((s, e) => s + Number(e.count), 0)} pendentes</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {forecastMargin >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                  <span className="text-xs text-muted-foreground">Margem Prevista</span>
                </div>
                <p className={`text-2xl font-bold ${forecastMargin >= 0 ? "text-green-700" : "text-red-700"}`}>{fmt(forecastMargin)}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-muted-foreground">Total Estimado</span>
                </div>
                <p className="text-2xl font-bold">{fmt(totalDeliveryRevenue + totalForecastRevenue)}</p>
                <p className="text-xs text-muted-foreground">Realizado + Previsto</p>
              </Card>
            </div>

            {/* Previsão receita por projeto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" /> Receita Prevista por Projeto
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
                        <th className="p-2 text-right font-bold">Receita Prevista</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecast.map((f, i) => (
                        <tr key={i} className="border-b hover:bg-muted/50">
                          <td className="p-2 flex items-center gap-2">
                            <FolderTree className="w-3 h-3 text-muted-foreground" />
                            {f.projectName ?? "Sem projeto"}
                          </td>
                          <td className="p-2 text-right tabular-nums">{f.count}</td>
                          <td className="p-2 text-right tabular-nums font-bold">{fmt(Number(f.totalRevenue))}</td>
                        </tr>
                      ))}
                      <tr className="bg-muted/30 font-bold">
                        <td className="p-2">Total</td>
                        <td className="p-2 text-right">{forecast.reduce((s, f) => s + Number(f.count), 0)}</td>
                        <td className="p-2 text-right">{fmt(totalForecastRevenue)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* Despesas a pagar por projeto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Despesas a Pagar por Projeto
                </CardTitle>
                <p className="text-xs text-muted-foreground">Despesas pendentes com vencimento no período</p>
              </CardHeader>
              <CardContent>
                {expPendByProject.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">Sem despesas pendentes no período</p>
                ) : (
                  <div className="space-y-4">
                    {expPendByProject.map((proj) => (
                      <div key={proj.projectName} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {proj.projectName}
                          </span>
                          <span className="font-bold text-orange-700">{fmt(proj.total)}</span>
                        </div>
                        <div className="space-y-1">
                          {proj.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm text-muted-foreground">
                              <span>{item.supplier} · {item.category}</span>
                              <span className="tabular-nums">{fmt(item.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total a Pagar</span>
                      <span className="text-orange-700">{fmt(totalExpensesPending)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
