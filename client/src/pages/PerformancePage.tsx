import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Trophy, RefreshCw, TrendingUp, TrendingDown, Clock,
  Zap, AlertTriangle, Award, ChevronUp, ChevronDown, Minus
} from "lucide-react";

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default function PerformancePage() {
  const { user } = useAuth();
  const now = new Date();
  const [week, setWeek] = useState(getWeekNumber(now));
  const [year, setYear] = useState(now.getFullYear());

  const queryInput = useMemo(() => ({ weekNumber: week, yearNumber: year }), [week, year]);
  const { data: evaluations = [], isLoading } = trpc.performance.list.useQuery(queryInput);
  const generateMut = trpc.performance.generate.useMutation();
  const utils = trpc.useUtils();
  const { data: employees = [] } = trpc.rh.list.useQuery();

  const employeeMap = useMemo(() => {
    const map = new Map<number, string>();
    employees.forEach((e: any) => map.set(e.id, e.fullName));
    return map;
  }, [employees]);

  const handleGenerate = async () => {
    try {
      await generateMut.mutateAsync({ weekNumber: week, yearNumber: year });
      utils.performance.list.invalidate();
      toast.success(`Avaliação da semana ${week} gerada com sucesso!`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar avaliação");
    }
  };

  const topPerformer = evaluations.length > 0 ? evaluations[0] : null;
  const totalHours = evaluations.reduce((s: number, e: any) => s + (e.hoursWorked || 0), 0);
  const totalMovements = evaluations.reduce((s: number, e: any) => s + (e.movementsCount || 0), 0);
  const totalAlerts = evaluations.reduce((s: number, e: any) => s + (e.speedAlerts || 0), 0);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-muted-foreground">Ranking semanal dos condutores</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label>Semana:</Label>
              <Input type="number" value={week} onChange={e => setWeek(parseInt(e.target.value) || 1)} min={1} max={53} className="w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Label>Ano:</Label>
              <Input type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || 2026)} className="w-24" />
            </div>
            <Button onClick={handleGenerate} disabled={generateMut.isPending}>
              <RefreshCw className={`w-4 h-4 mr-2 ${generateMut.isPending ? "animate-spin" : ""}`} />
              {generateMut.isPending ? "A gerar..." : "Gerar Avaliação"}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span className="text-xs text-muted-foreground">Total Horas</span></div>
            <p className="text-xl font-bold mt-1">{totalHours}h</p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500" /><span className="text-xs text-muted-foreground">Total Movimentações</span></div>
            <p className="text-xl font-bold mt-1">{totalMovements}</p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-xs text-muted-foreground">Alertas Velocidade</span></div>
            <p className="text-xl font-bold mt-1 text-red-600">{totalAlerts}</p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /><span className="text-xs text-muted-foreground">Melhor Condutor</span></div>
            <p className="text-sm font-bold mt-1 truncate">{topPerformer ? (employeeMap.get(topPerformer.employeeId) || `#${topPerformer.employeeId}`) : "—"}</p>
          </Card>
        </div>

        {/* Ranking Table */}
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : evaluations.length === 0 ? (
          <Card className="p-10 text-center">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Sem avaliações para esta semana</p>
            <p className="text-xs text-muted-foreground mt-1">Clica em "Gerar Avaliação" para calcular o ranking</p>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle className="text-base">Ranking — Semana {week}/{year}</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2 w-12">#</th>
                      <th className="p-2">Condutor</th>
                      <th className="p-2 text-center">Horas</th>
                      <th className="p-2 text-center">Movimentações</th>
                      <th className="p-2 text-center">Mov/Hora</th>
                      <th className="p-2 text-center">Alertas Vel.</th>
                      <th className="p-2 text-center">Ocorrências +</th>
                      <th className="p-2 text-center">Ocorrências -</th>
                      <th className="p-2 text-center">Pts +</th>
                      <th className="p-2 text-center">Pts -</th>
                      <th className="p-2 text-center font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((ev: any, idx: number) => {
                      const name = employeeMap.get(ev.employeeId) || ev.employeeName || `#${ev.employeeId}`;
                      const isTop3 = idx < 3;
                      return (
                        <tr key={ev.id} className={`border-b hover:bg-muted/50 ${isTop3 ? "bg-yellow-50/30" : ""}`}>
                          <td className="p-2 font-bold text-center">
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                          </td>
                          <td className="p-2 font-medium">{name}</td>
                          <td className="p-2 text-center">{ev.hoursWorked || 0}h</td>
                          <td className="p-2 text-center">{ev.movementsCount || 0}</td>
                          <td className="p-2 text-center">{ev.movementsPerHour || 0}</td>
                          <td className="p-2 text-center">
                            {ev.speedAlerts > 0 ? (
                              <Badge className="bg-red-100 text-red-700">{ev.speedAlerts}</Badge>
                            ) : (
                              <span className="text-green-600">0</span>
                            )}
                          </td>
                          <td className="p-2 text-center text-green-600">{ev.incidentsPositive || 0}</td>
                          <td className="p-2 text-center text-red-600">{ev.incidentsNegative || 0}</td>
                          <td className="p-2 text-center">
                            <span className="text-green-600 font-medium">+{ev.positivePoints || 0}</span>
                          </td>
                          <td className="p-2 text-center">
                            <span className="text-red-600 font-medium">-{ev.negativePoints || 0}</span>
                          </td>
                          <td className="p-2 text-center">
                            <span className={`font-bold text-lg ${(ev.totalPoints || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {ev.totalPoints || 0}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Points Legend */}
        <Card>
          <CardHeader><CardTitle className="text-base">Sistema de Pontos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-600 flex items-center gap-1 mb-2"><ChevronUp className="w-4 h-4" /> Pontos Positivos</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>+2 pts por cada movimentação</li>
                  <li>+5 pts por cada ocorrência reportada</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-600 flex items-center gap-1 mb-2"><ChevronDown className="w-4 h-4" /> Pontos Negativos</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>-10 pts por cada alerta de velocidade</li>
                  <li>-5 pts por cada ocorrência atribuída</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
