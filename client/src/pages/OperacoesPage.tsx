import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard, CalendarCheck, ArrowDownToLine, ArrowUpFromLine,
  XCircle, Wrench, Euro, Activity,
} from "lucide-react";
import MultiparkPage from "./MultiparkPage";
import ServicesPage from "./ServicesPage";

const fmtEur = (v: number | string | null | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return n.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
};

export default function OperacoesPage() {
  const [tab, setTab] = useState("dashboard");
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <p className="text-sm text-muted-foreground">
          Reservas, recolhas, entregas, cancelamentos e serviços extras
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-1" />Dashboard</TabsTrigger>
          <TabsTrigger value="reservas"><CalendarCheck className="w-4 h-4 mr-1" />Reservas</TabsTrigger>
          <TabsTrigger value="entradas"><ArrowDownToLine className="w-4 h-4 mr-1" />Recolhas</TabsTrigger>
          <TabsTrigger value="saidas"><ArrowUpFromLine className="w-4 h-4 mr-1" />Entregas</TabsTrigger>
          <TabsTrigger value="cancelados"><XCircle className="w-4 h-4 mr-1" />Cancelados</TabsTrigger>
          <TabsTrigger value="servicos"><Wrench className="w-4 h-4 mr-1" />Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <OperacoesDashboard onJump={setTab} />
        </TabsContent>
        <TabsContent value="reservas" className="mt-4">
          <MultiparkPage sectionProp="reservas" />
        </TabsContent>
        <TabsContent value="entradas" className="mt-4">
          <MultiparkPage sectionProp="entradas" />
        </TabsContent>
        <TabsContent value="saidas" className="mt-4">
          <MultiparkPage sectionProp="saidas" />
        </TabsContent>
        <TabsContent value="cancelados" className="mt-4">
          <MultiparkPage sectionProp="cancelados" />
        </TabsContent>
        <TabsContent value="servicos" className="mt-4">
          <ServicesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Dashboard simples ───────────────────────────────────────────────────────

function OperacoesDashboard({ onJump }: { onJump: (tab: string) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);

  const queries = {
    creation: trpc.multipark.localBookingsByAction.useQuery({ startDate: from, endDate: to, actionType: "creation" as const }, { refetchOnWindowFocus: false }),
    checkin: trpc.multipark.localBookingsByAction.useQuery({ startDate: from, endDate: to, actionType: "checkin" as const }, { refetchOnWindowFocus: false }),
    checkout: trpc.multipark.localBookingsByAction.useQuery({ startDate: from, endDate: to, actionType: "checkout" as const }, { refetchOnWindowFocus: false }),
    cancelation: trpc.multipark.localBookingsByAction.useQuery({ startDate: from, endDate: to, actionType: "cancelation" as const }, { refetchOnWindowFocus: false }),
  };

  const stats = useMemo(() => {
    const sum = (b: any[] | undefined) => (b ?? []).reduce((s, x) => s + (parseFloat(x.totalPrice) || 0), 0);
    const reservas = queries.creation.data?.bookings ?? [];
    const recolhas = queries.checkin.data?.bookings ?? [];
    const entregas = queries.checkout.data?.bookings ?? [];
    const cancelados = queries.cancelation.data?.bookings ?? [];
    return {
      reservas: reservas.length,
      reservasReceita: sum(reservas),
      recolhas: recolhas.length,
      entregas: entregas.length,
      entregasReceita: sum(entregas),
      cancelados: cancelados.length,
      canceladosReceita: sum(cancelados),
    };
  }, [queries.creation.data, queries.checkin.data, queries.checkout.data, queries.cancelation.data]);

  const isLoading = queries.creation.isLoading || queries.checkin.isLoading || queries.checkout.isLoading || queries.cancelation.isLoading;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div>
            <Label className="text-xs mb-1 block">De</Label>
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-40" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Até</Label>
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-40" />
          </div>
          <div className="text-xs text-muted-foreground ml-auto">
            {isLoading ? "A carregar..." : `${from} → ${to}`}
          </div>
        </CardContent>
      </Card>

      {/* KPIs clicáveis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={<CalendarCheck className="w-5 h-5 text-blue-600" />}
          label="Reservas criadas"
          value={stats.reservas}
          extra={fmtEur(stats.reservasReceita)}
          onClick={() => onJump("reservas")}
        />
        <KpiCard
          icon={<ArrowDownToLine className="w-5 h-5 text-emerald-600" />}
          label="Recolhas"
          value={stats.recolhas}
          onClick={() => onJump("entradas")}
        />
        <KpiCard
          icon={<ArrowUpFromLine className="w-5 h-5 text-amber-600" />}
          label="Entregas"
          value={stats.entregas}
          extra={fmtEur(stats.entregasReceita)}
          onClick={() => onJump("saidas")}
        />
        <KpiCard
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          label="Cancelados"
          value={stats.cancelados}
          extra={fmtEur(stats.canceladosReceita)}
          onClick={() => onJump("cancelados")}
        />
      </div>

      {/* Ratios */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Receita média / entrega</p>
            <p className="text-xl font-bold text-emerald-700">
              {stats.entregas > 0 ? fmtEur(stats.entregasReceita / stats.entregas) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Taxa de cancelamento</p>
            <p className="text-xl font-bold text-red-700">
              {stats.reservas > 0 ? `${((stats.cancelados / stats.reservas) * 100).toFixed(1)}%` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Conversão recolha → entrega</p>
            <p className="text-xl font-bold text-blue-700">
              {stats.recolhas > 0 ? `${((stats.entregas / stats.recolhas) * 100).toFixed(1)}%` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Activity className="w-3 h-3" />
        Clica num cartão para ir directo à tabela da secção
      </p>
    </div>
  );
}

function KpiCard({
  icon, label, value, extra, onClick,
}: { icon: React.ReactNode; label: string; value: number; extra?: string; onClick?: () => void }) {
  return (
    <Card
      className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {extra && <p className="text-xs text-muted-foreground truncate"><Euro className="w-3 h-3 inline" /> {extra}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
