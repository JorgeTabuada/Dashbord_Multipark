import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Euro,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  useDashboardFilters,
  DashboardFilterBar,
} from "@/components/DashboardFilterBar";

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

function fmt(v: number) {
  return v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg ?? "bg-primary/10"}`}
          >
            <Icon className={`h-5 w-5 ${iconColor ?? "text-primary"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-7 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonChart({ height = 240 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function FinanceiroDashboard() {
  const filters = useDashboardFilters();

  // Booking stats (entregas / receita)
  const { data: bookingStats, isLoading: bookingLoading } =
    trpc.multipark.bookingStats.useQuery({
      from: filters.from,
      to: filters.to,
      projectId: filters.projectId,
    });

  // Expense stats
  const { data: expenseStats, isLoading: expenseLoading } =
    trpc.expenses.stats.useQuery();

  // Upcoming payments
  const { data: upcoming, isLoading: upcomingLoading } =
    trpc.expenses.upcomingPayments.useQuery();

  const isLoading = bookingLoading || expenseLoading;

  // KPI values
  const receitaPeriodo = bookingStats?.receitaPeriodo ?? 0;
  const despesasMes = expenseStats?.monthly?.total ?? 0;
  const pendente = expenseStats?.pending?.total ?? 0;
  const emAtraso = expenseStats?.overdue?.total ?? 0;
  const margem = receitaPeriodo - despesasMes;

  // Revenue by city (donut)
  const byCityData = (bookingStats?.byCity ?? []).map((c: any) => ({
    name: c.name ?? "Desconhecido",
    value: c.revenue ?? 0,
    bookings: c.bookings ?? 0,
  }));

  // Revenue by brand (donut)
  const byBrandData = (bookingStats?.byBrand ?? []).map((b: any) => ({
    name: b.name ?? "Desconhecido",
    value: b.revenue ?? 0,
    bookings: b.bookings ?? 0,
  }));

  // Monthly evolution: merge booking revenue (byDay) with expense trend
  const expenseTrendMap = new Map(
    (expenseStats?.monthlyTrend ?? []).map((m: any) => [m.month, m.total ?? 0])
  );

  // Group byDay revenue into months for comparison with expense monthlyTrend
  const revenueByMonth = new Map<string, number>();
  for (const day of bookingStats?.byDay ?? []) {
    const monthKey = (day.date as string).slice(0, 7); // YYYY-MM
    revenueByMonth.set(
      monthKey,
      (revenueByMonth.get(monthKey) ?? 0) + (day.revenue ?? 0)
    );
  }

  // Build unified monthly evolution data from the union of both sources
  const allMonths = new Set([
    ...revenueByMonth.keys(),
    ...expenseTrendMap.keys(),
  ]);
  const monthlyEvolution = Array.from(allMonths)
    .sort()
    .map((month) => ({
      month,
      receita: revenueByMonth.get(month) ?? 0,
      despesas: expenseTrendMap.get(month) ?? 0,
    }));

  // Expenses by category (pie)
  const categoryData = (expenseStats?.byCategory ?? []).map((c: any) => ({
    name: c.categoryName ?? "Sem categoria",
    value: c.total ?? 0,
    count: c.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">
          Entregas, despesas e margem por cidade e marca
        </p>
      </div>

      {/* Filter Bar */}
      <DashboardFilterBar
        from={filters.from}
        to={filters.to}
        onFromChange={filters.setFrom}
        onToChange={filters.setTo}
        cityId={filters.cityId}
        onCityChange={filters.setCityId}
        brandId={filters.brandId}
        onBrandChange={filters.setBrandId}
        showPeriod
        period={filters.period}
        onPeriodChange={filters.setPeriod}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              title="Receita Periodo"
              value={fmt(receitaPeriodo)}
              subtitle="entregas no periodo"
              icon={Euro}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Despesas Mes"
              value={fmt(despesasMes)}
              subtitle={`${expenseStats?.monthly?.count ?? 0} registos`}
              icon={TrendingDown}
              iconBg="bg-red-100"
              iconColor="text-red-600"
            />
            <StatCard
              title="Pendente"
              value={fmt(pendente)}
              subtitle={`${expenseStats?.pending?.count ?? 0} despesa(s)`}
              icon={Clock}
              iconBg="bg-yellow-100"
              iconColor="text-yellow-600"
            />
            <StatCard
              title="Em Atraso"
              value={fmt(emAtraso)}
              subtitle={`${expenseStats?.overdue?.count ?? 0} despesa(s)`}
              icon={AlertCircle}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
            <StatCard
              title="Margem"
              value={fmt(margem)}
              subtitle="receita - despesas"
              icon={TrendingUp}
              iconBg={margem >= 0 ? "bg-emerald-100" : "bg-red-100"}
              iconColor={margem >= 0 ? "text-emerald-600" : "text-red-600"}
            />
          </>
        )}
      </div>

      {/* Charts Row 1: Donut charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by city */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Receita por Cidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingLoading ? (
              <SkeletonChart />
            ) : byCityData.length === 0 ? (
              <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">
                Sem dados disponiveis
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={byCityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {byCityData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any, _name: any, props: any) => [
                      `${fmt(parseFloat(String(v)))} (${props.payload.bookings} reservas)`,
                      props.payload.name,
                    ]}
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue by brand */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Receita por Marca
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingLoading ? (
              <SkeletonChart />
            ) : byBrandData.length === 0 ? (
              <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">
                Sem dados disponiveis
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={byBrandData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {byBrandData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any, _name: any, props: any) => [
                      `${fmt(parseFloat(String(v)))} (${props.payload.bookings} reservas)`,
                      props.payload.name,
                    ]}
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Monthly evolution + Category pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly evolution area chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Evolucao Mensal: Receita vs Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonChart />
            ) : monthlyEvolution.length === 0 ? (
              <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">
                Sem dados mensais disponiveis
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={monthlyEvolution}
                  margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient
                      id="colorReceita"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorDespesas"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#ef4444"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#ef4444"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(v) => `${v}€`}
                  />
                  <Tooltip
                    formatter={(v: any, name: string) => [
                      fmt(parseFloat(String(v))),
                      name === "receita" ? "Receita" : "Despesas",
                    ]}
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    formatter={(value) =>
                      value === "receita" ? "Receita" : "Despesas"
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReceita)"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDespesas)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Expenses by category pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseLoading ? (
              <SkeletonChart />
            ) : categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">
                Sem dados disponiveis
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => [fmt(parseFloat(String(v)))]}
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming payments table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            Pagamentos nos Proximos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                >
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-14 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : !upcoming || upcoming.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum pagamento pendente nos proximos 7 dias
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(({ expense, project }: any) => {
                const daysLeft = Math.ceil(
                  (new Date(expense.paymentDueDate).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {expense.supplier ?? "Sem fornecedor"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {project?.name ?? "Sem projeto"} · Vence em{" "}
                        {format(new Date(expense.paymentDueDate), "dd MMM", {
                          locale: pt,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="font-semibold text-sm">
                        {fmt(parseFloat(String(expense.amount)))}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          daysLeft <= 1
                            ? "border-red-300 text-red-700 bg-red-50"
                            : daysLeft <= 3
                              ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                              : "border-blue-300 text-blue-700 bg-blue-50"
                        }
                      >
                        {daysLeft === 0
                          ? "Hoje"
                          : daysLeft === 1
                            ? "Amanha"
                            : `${daysLeft} dias`}
                      </Badge>
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
