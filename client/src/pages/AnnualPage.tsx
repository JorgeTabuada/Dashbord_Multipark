import { trpc } from "@/lib/trpc";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useEffect } from "react";
import {
  CalendarDays, Euro, TrendingUp, TrendingDown,
  BarChart3, ArrowUpRight, ArrowDownRight, Receipt, Users, Landmark,
} from "lucide-react";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const fmt = (v: number) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);

export default function AnnualPage() {
  const filters = useGlobalFilters();
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedProject, setSelectedProject] = useState<string>("all");

  useEffect(() => {
    if (filters.projectId !== undefined) {
      setSelectedProject(String(filters.projectId));
    } else {
      setSelectedProject("all");
    }
  }, [filters.projectId]);

  const projectId = selectedProject !== "all" ? parseInt(selectedProject) : undefined;

  const { data: months = [], isLoading } = trpc.annual.breakdown.useQuery({ year, projectId });
  const { data: projects = [] } = trpc.projects.list.useQuery();

  const totals = useMemo(() => {
    let revenueWithVat = 0, revenueNoVat = 0, vatRevenue = 0;
    let expensesWithVat = 0, expensesNoVat = 0, vatExpenses = 0, vatToPay = 0;
    let salaries = 0, employerTax = 0, totalCosts = 0, profit = 0;
    for (const m of months) {
      revenueWithVat += m.revenueWithVat;
      revenueNoVat += m.revenueNoVat;
      vatRevenue += m.vatRevenue;
      expensesWithVat += m.expensesWithVat;
      expensesNoVat += m.expensesNoVat;
      vatExpenses += m.vatExpenses;
      vatToPay += m.vatToPay;
      salaries += m.salaries;
      employerTax += m.employerTax;
      totalCosts += m.totalCosts;
      profit += m.profit;
    }
    return { revenueWithVat, revenueNoVat, vatRevenue, expensesWithVat, expensesNoVat, vatExpenses, vatToPay, salaries, employerTax, totalCosts, profit };
  }, [months]);

  const maxVal = Math.max(...months.map(m => Math.max(m.revenueNoVat, m.totalCosts)), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-muted-foreground">Visão anual: receitas, despesas, IVA, ordenados e lucro</p>
        <div className="flex items-center gap-2 flex-wrap">
          <div>
            <Label className="text-xs mb-1 block">Ano</Label>
            <Input type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || 2026)} className="w-24" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Projeto</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Projetos</SelectItem>
                {projects.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Euro className="w-4 h-4 text-green-600" />
                <span className="text-[10px] text-muted-foreground">Receita s/IVA</span>
              </div>
              <p className="text-lg font-bold text-green-700">{fmt(totals.revenueNoVat)}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Receipt className="w-4 h-4 text-red-600" />
                <span className="text-[10px] text-muted-foreground">Despesas s/IVA</span>
              </div>
              <p className="text-lg font-bold text-red-700">{fmt(totals.expensesNoVat)}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] text-muted-foreground">Ordenados</span>
              </div>
              <p className="text-lg font-bold text-orange-700">{fmt(totals.salaries)}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Landmark className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] text-muted-foreground">TSU Patronal</span>
              </div>
              <p className="text-lg font-bold text-purple-700">{fmt(totals.employerTax)}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <ArrowUpRight className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] text-muted-foreground">IVA Receitas</span>
              </div>
              <p className="text-lg font-bold text-blue-700">{fmt(totals.vatRevenue)}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <ArrowDownRight className="w-4 h-4 text-cyan-600" />
                <span className="text-[10px] text-muted-foreground">IVA Despesas</span>
              </div>
              <p className="text-lg font-bold text-cyan-700">{fmt(totals.vatExpenses)}</p>
            </Card>
            <Card className="p-3 border-2 border-primary/20">
              <div className="flex items-center gap-1 mb-1">
                {totals.profit >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                <span className="text-[10px] text-muted-foreground font-medium">Lucro</span>
              </div>
              <p className={`text-lg font-bold ${totals.profit >= 0 ? "text-green-700" : "text-red-700"}`}>{fmt(totals.profit)}</p>
            </Card>
          </div>

          {/* IVA summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-4 bg-blue-50/50">
              <p className="text-xs text-muted-foreground mb-1">IVA Cobrado (23% das saídas)</p>
              <p className="text-2xl font-bold text-blue-700">{fmt(totals.vatRevenue)}</p>
            </Card>
            <Card className="p-4 bg-cyan-50/50">
              <p className="text-xs text-muted-foreground mb-1">IVA Dedutível (23% das despesas)</p>
              <p className="text-2xl font-bold text-cyan-700">{fmt(totals.vatExpenses)}</p>
            </Card>
            <Card className={`p-4 ${totals.vatToPay >= 0 ? "bg-red-50/50" : "bg-green-50/50"}`}>
              <p className="text-xs text-muted-foreground mb-1">IVA a {totals.vatToPay >= 0 ? "Pagar" : "Recuperar"}</p>
              <p className={`text-2xl font-bold ${totals.vatToPay >= 0 ? "text-red-700" : "text-green-700"}`}>{fmt(Math.abs(totals.vatToPay))}</p>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {MONTHS.map((month, idx) => {
                  const m = months.find(r => r.month === idx + 1);
                  const rev = m?.revenueNoVat ?? 0;
                  const costs = m?.totalCosts ?? 0;
                  const revH = maxVal > 0 ? (rev / maxVal) * 100 : 0;
                  const costH = maxVal > 0 ? (costs / maxVal) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-0.5 items-end" style={{ height: "160px" }}>
                        <div className="flex-1 bg-green-400 rounded-t transition-all" style={{ height: `${revH}%` }} title={`Receita: ${fmt(rev)}`} />
                        <div className="flex-1 bg-red-300 rounded-t transition-all" style={{ height: `${costH}%` }} title={`Custos: ${fmt(costs)}`} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{month.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded" /> Receita s/IVA</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-300 rounded" /> Custos Totais</span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly detail table */}
          <Card>
            <CardHeader><CardTitle className="text-base">Detalhe Mensal — {year}</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs">
                      <th className="p-2">Mês</th>
                      <th className="p-2 text-right">Receita c/IVA</th>
                      <th className="p-2 text-right">IVA Receita</th>
                      <th className="p-2 text-right">Receita s/IVA</th>
                      <th className="p-2 text-right">Despesas c/IVA</th>
                      <th className="p-2 text-right">IVA Despesas</th>
                      <th className="p-2 text-right">Despesas s/IVA</th>
                      <th className="p-2 text-right">Ordenados</th>
                      <th className="p-2 text-right">TSU</th>
                      <th className="p-2 text-right">IVA a Pagar</th>
                      <th className="p-2 text-right font-bold">Lucro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {months.sort((a, b) => a.month - b.month).map(m => (
                      <tr key={m.month} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{MONTHS[m.month - 1]}</td>
                        <td className="p-2 text-right tabular-nums text-green-600">{fmt(m.revenueWithVat)}</td>
                        <td className="p-2 text-right tabular-nums text-blue-600">{fmt(m.vatRevenue)}</td>
                        <td className="p-2 text-right tabular-nums text-green-700 font-medium">{fmt(m.revenueNoVat)}</td>
                        <td className="p-2 text-right tabular-nums text-red-600">{fmt(m.expensesWithVat)}</td>
                        <td className="p-2 text-right tabular-nums text-cyan-600">{fmt(m.vatExpenses)}</td>
                        <td className="p-2 text-right tabular-nums text-red-700 font-medium">{fmt(m.expensesNoVat)}</td>
                        <td className="p-2 text-right tabular-nums text-orange-600">{fmt(m.salaries)}</td>
                        <td className="p-2 text-right tabular-nums text-purple-600">{fmt(m.employerTax)}</td>
                        <td className={`p-2 text-right tabular-nums ${m.vatToPay >= 0 ? "text-red-600" : "text-green-600"}`}>{fmt(m.vatToPay)}</td>
                        <td className="p-2 text-right tabular-nums font-bold">
                          <span className={m.profit >= 0 ? "text-green-700" : "text-red-700"}>
                            {m.profit >= 0 ? "+" : ""}{fmt(m.profit)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Totals */}
                    <tr className="border-t-2 font-bold bg-muted/30">
                      <td className="p-2">TOTAL</td>
                      <td className="p-2 text-right text-green-600">{fmt(totals.revenueWithVat)}</td>
                      <td className="p-2 text-right text-blue-600">{fmt(totals.vatRevenue)}</td>
                      <td className="p-2 text-right text-green-700">{fmt(totals.revenueNoVat)}</td>
                      <td className="p-2 text-right text-red-600">{fmt(totals.expensesWithVat)}</td>
                      <td className="p-2 text-right text-cyan-600">{fmt(totals.vatExpenses)}</td>
                      <td className="p-2 text-right text-red-700">{fmt(totals.expensesNoVat)}</td>
                      <td className="p-2 text-right text-orange-600">{fmt(totals.salaries)}</td>
                      <td className="p-2 text-right text-purple-600">{fmt(totals.employerTax)}</td>
                      <td className={`p-2 text-right ${totals.vatToPay >= 0 ? "text-red-600" : "text-green-600"}`}>{fmt(totals.vatToPay)}</td>
                      <td className="p-2 text-right">
                        <span className={totals.profit >= 0 ? "text-green-700" : "text-red-700"}>
                          {totals.profit >= 0 ? "+" : ""}{fmt(totals.profit)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
