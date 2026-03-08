import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import {
  CalendarDays, RefreshCw, Euro, TrendingUp, TrendingDown,
  PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Info, Pencil, Sliders
} from "lucide-react";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function AnnualPage() {
  const { user } = useAuth();
  const filters = useGlobalFilters();
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedProject, setSelectedProject] = useState<string>("all");

  // Sync global filter to local project filter
  useEffect(() => {
    if (filters.projectId !== undefined) {
      setSelectedProject(String(filters.projectId));
    } else {
      setSelectedProject("all");
    }
  }, [filters.projectId]);
  const [splitPartner, setSplitPartner] = useState(60);
  const [showSplitConfig, setShowSplitConfig] = useState(false);
  const [editReport, setEditReport] = useState<any>(null);
  const [showDataInfo, setShowDataInfo] = useState(false);

  const queryInput = useMemo(() => {
    const input: any = { year };
    if (selectedProject !== "all") input.projectId = parseInt(selectedProject);
    return input;
  }, [year, selectedProject]);

  const { data: reports = [], isLoading } = trpc.annual.list.useQuery(queryInput);
  const { data: projects = [] } = trpc.projects.list.useQuery();
  const generateMut = trpc.annual.generate.useMutation();
  const updateMut = trpc.annual.update.useMutation();
  const utils = trpc.useUtils();

  const handleGenerate = async () => {
    try {
      await generateMut.mutateAsync({
        year,
        projectId: selectedProject !== "all" ? parseInt(selectedProject) : undefined,
        splitPartner,
      });
      utils.annual.list.invalidate();
      toast.success(`Relatório anual ${year} gerado (${splitPartner}/${100 - splitPartner})!`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar relatório");
    }
  };

  const handleUpdateReport = async () => {
    if (!editReport) return;
    try {
      await updateMut.mutateAsync({
        id: editReport.id,
        totalRevenue: Math.round(parseFloat(editReport.totalRevenue) * 100) || 0,
        totalExpenses: Math.round(parseFloat(editReport.totalExpenses) * 100) || 0,
        partnerShare: Math.round(parseFloat(editReport.partnerShare) * 100) || 0,
        companyShare: Math.round(parseFloat(editReport.companyShare) * 100) || 0,
        splitRatio: editReport.splitRatio,
        notes: editReport.notes || undefined,
      });
      utils.annual.list.invalidate();
      toast.success("Relatório atualizado");
      setEditReport(null);
    } catch (e: any) { toast.error(e.message || "Erro"); }
  };

  const formatCents = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  const totals = useMemo(() => {
    let revenue = 0, expenses = 0, partnerShare = 0, companyShare = 0;
    for (const r of reports) {
      revenue += r.totalRevenue || 0;
      expenses += r.totalExpenses || 0;
      partnerShare += r.partnerShare || 0;
      companyShare += r.companyShare || 0;
    }
    return { revenue, expenses, profit: revenue - expenses, partnerShare, companyShare };
  }, [reports]);

  const maxRevenue = Math.max(...reports.map((r: any) => r.totalRevenue || 0), 1);

  // Detect split ratio from existing reports
  const currentSplit = reports.length > 0 ? (reports[0] as any).splitRatio || "60/40" : `${splitPartner}/${100 - splitPartner}`;
  const [partnerPctLabel, companyPctLabel] = currentSplit.split("/");

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-muted-foreground">Visão anual de receitas, despesas e partilha de lucros</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Input type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || 2026)} className="w-24" />
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Todos os parques" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Parques</SelectItem>
                {projects.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setShowSplitConfig(true)} title="Configurar divisão">
              <Sliders className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowDataInfo(true)} title="Fontes de dados">
              <Info className="w-4 h-4" />
            </Button>
            <Button onClick={handleGenerate} disabled={generateMut.isPending}>
              <RefreshCw className={`w-4 h-4 mr-2 ${generateMut.isPending ? "animate-spin" : ""}`} />
              {generateMut.isPending ? "A gerar..." : "Gerar Relatório"}
            </Button>
          </div>
        </div>

        {/* Split ratio indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">Parceiro: {partnerPctLabel}%</Badge>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700">Empresa: {companyPctLabel}%</Badge>
          <span className="text-xs">(clica no ícone de configuração para alterar)</span>
        </div>

        {/* Annual Totals */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2"><Euro className="w-4 h-4 text-green-500" /><span className="text-xs text-muted-foreground">Receita Total</span></div>
            <p className="text-xl font-bold mt-1 text-green-600">{formatCents(totals.revenue)}</p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-xs text-muted-foreground">Despesas Total</span></div>
            <p className="text-xl font-bold mt-1 text-red-600">{formatCents(totals.expenses)}</p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" /><span className="text-xs text-muted-foreground">Lucro</span></div>
            <p className={`text-xl font-bold mt-1 ${totals.profit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCents(totals.profit)}</p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2"><PieChart className="w-4 h-4 text-purple-500" /><span className="text-xs text-muted-foreground">Parceiro ({partnerPctLabel}%)</span></div>
            <p className="text-xl font-bold mt-1 text-purple-600">{formatCents(totals.partnerShare)}</p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2"><PieChart className="w-4 h-4 text-indigo-500" /><span className="text-xs text-muted-foreground">Empresa ({companyPctLabel}%)</span></div>
            <p className="text-xl font-bold mt-1 text-indigo-600">{formatCents(totals.companyShare)}</p>
          </Card>
        </div>

        {/* Monthly Chart */}
        {reports.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Evolução Mensal</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {MONTHS.map((month, idx) => {
                  const report = reports.find((r: any) => r.month === idx + 1);
                  const revenue = report?.totalRevenue || 0;
                  const expense = report?.totalExpenses || 0;
                  const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                  const expHeight = maxRevenue > 0 ? (expense / maxRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-0.5 items-end" style={{ height: "160px" }}>
                        <div className="flex-1 bg-green-400 rounded-t transition-all" style={{ height: `${height}%` }} title={`Receita: ${formatCents(revenue)}`} />
                        <div className="flex-1 bg-red-300 rounded-t transition-all" style={{ height: `${expHeight}%` }} title={`Despesas: ${formatCents(expense)}`} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{month.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded" /> Receita (Faturas + Serviços)</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-300 rounded" /> Despesas</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Table */}
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : reports.length === 0 ? (
          <Card className="p-10 text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Sem dados para {year}</p>
            <p className="text-xs text-muted-foreground mt-1">Clica em "Gerar Relatório" para calcular a partir das Faturas, Serviços e Despesas</p>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle className="text-base">Detalhe Mensal — {year}</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">Mês</th>
                      <th className="p-2 text-right">Receita</th>
                      <th className="p-2 text-right">Despesas</th>
                      <th className="p-2 text-right">Lucro</th>
                      <th className="p-2 text-right">Parceiro</th>
                      <th className="p-2 text-right">Empresa</th>
                      <th className="p-2 text-center">Rácio</th>
                      <th className="p-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.sort((a: any, b: any) => a.month - b.month).map((r: any) => {
                      const profit = (r.totalRevenue || 0) - (r.totalExpenses || 0);
                      return (
                        <tr key={r.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{MONTHS[r.month - 1]}</td>
                          <td className="p-2 text-right text-green-600">{formatCents(r.totalRevenue || 0)}</td>
                          <td className="p-2 text-right text-red-600">{formatCents(r.totalExpenses || 0)}</td>
                          <td className="p-2 text-right">
                            <span className={`font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {profit >= 0 ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                              {formatCents(profit)}
                            </span>
                          </td>
                          <td className="p-2 text-right text-purple-600">{formatCents(r.partnerShare || 0)}</td>
                          <td className="p-2 text-right text-indigo-600">{formatCents(r.companyShare || 0)}</td>
                          <td className="p-2 text-center"><Badge variant="outline">{r.splitRatio || "60/40"}</Badge></td>
                          <td className="p-2 text-center">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditReport({
                              id: r.id,
                              month: r.month,
                              totalRevenue: ((r.totalRevenue || 0) / 100).toFixed(2),
                              totalExpenses: ((r.totalExpenses || 0) / 100).toFixed(2),
                              partnerShare: ((r.partnerShare || 0) / 100).toFixed(2),
                              companyShare: ((r.companyShare || 0) / 100).toFixed(2),
                              splitRatio: r.splitRatio || "60/40",
                              notes: r.notes || "",
                            })}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Totals row */}
                    <tr className="border-t-2 font-bold">
                      <td className="p-2">TOTAL</td>
                      <td className="p-2 text-right text-green-600">{formatCents(totals.revenue)}</td>
                      <td className="p-2 text-right text-red-600">{formatCents(totals.expenses)}</td>
                      <td className="p-2 text-right">
                        <span className={totals.profit >= 0 ? "text-green-600" : "text-red-600"}>{formatCents(totals.profit)}</span>
                      </td>
                      <td className="p-2 text-right text-purple-600">{formatCents(totals.partnerShare)}</td>
                      <td className="p-2 text-right text-indigo-600">{formatCents(totals.companyShare)}</td>
                      <td className="p-2 text-center">—</td>
                      <td className="p-2 text-center">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Split Configuration Dialog */}
      {showSplitConfig && (
        <Dialog open onOpenChange={() => setShowSplitConfig(false)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Configurar Divisão de Lucros</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Define a percentagem do parceiro. A empresa recebe o restante.</p>
              <div className="space-y-2">
                <Label>Parceiro (%)</Label>
                <Input type="number" min={0} max={100} value={splitPartner} onChange={e => setSplitPartner(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} />
              </div>
              <div className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3">
                <div className="text-center">
                  <p className="font-bold text-purple-600 text-lg">{splitPartner}%</p>
                  <p className="text-xs text-muted-foreground">Parceiro</p>
                </div>
                <div className="text-muted-foreground">/</div>
                <div className="text-center">
                  <p className="font-bold text-indigo-600 text-lg">{100 - splitPartner}%</p>
                  <p className="text-xs text-muted-foreground">Empresa</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Esta configuração será aplicada ao próximo "Gerar Relatório".</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSplitConfig(false)}>Fechar</Button>
              <Button onClick={() => { setShowSplitConfig(false); toast.success(`Divisão configurada: ${splitPartner}/${100 - splitPartner}`); }}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Data Sources Info Dialog */}
      {showDataInfo && (
        <Dialog open onOpenChange={() => setShowDataInfo(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-blue-500" /> Fontes de Dados</DialogTitle></DialogHeader>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">O relatório anual é calculado automaticamente a partir dos seguintes módulos:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                  <div>
                    <p className="font-medium text-green-800">Receita</p>
                    <p className="text-green-700 text-xs">Faturas (módulo Faturação) + Receita de Serviços (lavagens, carregamentos, valet)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                  <div>
                    <p className="font-medium text-red-800">Despesas</p>
                    <p className="text-red-700 text-xs">Despesas gerais (módulo Despesas) + Custos de Serviços</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                  <div>
                    <p className="font-medium text-purple-800">Divisão de Lucros</p>
                    <p className="text-purple-700 text-xs">Lucro (Receita - Despesas) dividido conforme o rácio configurado (ex: 60% parceiro / 40% empresa)</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Podes editar manualmente cada mês clicando no ícone de lápis na tabela.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDataInfo(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Report Dialog */}
      {editReport && (
        <Dialog open onOpenChange={() => setEditReport(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar {MONTHS[editReport.month - 1]}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Receita (€)</Label>
                  <Input type="number" step="0.01" value={editReport.totalRevenue} onChange={e => setEditReport({ ...editReport, totalRevenue: e.target.value })} />
                </div>
                <div>
                  <Label>Despesas (€)</Label>
                  <Input type="number" step="0.01" value={editReport.totalExpenses} onChange={e => setEditReport({ ...editReport, totalExpenses: e.target.value })} />
                </div>
                <div>
                  <Label>Parceiro (€)</Label>
                  <Input type="number" step="0.01" value={editReport.partnerShare} onChange={e => setEditReport({ ...editReport, partnerShare: e.target.value })} />
                </div>
                <div>
                  <Label>Empresa (€)</Label>
                  <Input type="number" step="0.01" value={editReport.companyShare} onChange={e => setEditReport({ ...editReport, companyShare: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Rácio</Label>
                <Input value={editReport.splitRatio} onChange={e => setEditReport({ ...editReport, splitRatio: e.target.value })} placeholder="60/40" />
              </div>
              <div>
                <Label>Notas</Label>
                <Textarea value={editReport.notes} onChange={e => setEditReport({ ...editReport, notes: e.target.value })} placeholder="Notas adicionais..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditReport(null)}>Cancelar</Button>
              <Button onClick={handleUpdateReport} disabled={updateMut.isPending}>{updateMut.isPending ? "A guardar..." : "Guardar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
