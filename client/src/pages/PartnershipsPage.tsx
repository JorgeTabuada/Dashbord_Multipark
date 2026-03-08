import { trpc } from "@/lib/trpc";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import {
  Handshake, Users, Euro, TrendingUp, Percent, Building2,
  ArrowRightLeft, Crown,
} from "lucide-react";

const fmt = (v: number) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);

export default function PartnershipsPage() {
  const filters = useGlobalFilters();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);

  const projectId = useMemo(() => {
    if (filters.brandId !== null) return filters.brandId;
    if (filters.cityId !== null) return filters.cityId;
    return undefined;
  }, [filters.cityId, filters.brandId]);

  const { data, isLoading } = trpc.partnerships.analytics.useQuery({ from, to, projectId });

  const partners = data?.partners ?? [];
  const proBookings = data?.proBookings ?? [];
  const totals = data?.totals ?? { partnerBookings: 0, partnerRevenue: 0, directBookings: 0, directRevenue: 0, proBookings: 0, proRevenue: 0 };

  const totalBookings = totals.partnerBookings + totals.directBookings;
  const totalRevenue = totals.partnerRevenue + totals.directRevenue;
  const partnerPct = totalBookings > 0 ? ((totals.partnerBookings / totalBookings) * 100).toFixed(1) : "0";

  // Group partners by campaign name (aggregate across cities/parks)
  const partnerSummary = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number; discount: number; avgPrice: number; cities: Set<string>; parks: Set<string> }>();
    for (const p of partners) {
      const key = p.campaign ?? "Desconhecido";
      if (!map.has(key)) map.set(key, { count: 0, revenue: 0, discount: 0, avgPrice: 0, cities: new Set(), parks: new Set() });
      const entry = map.get(key)!;
      entry.count += p.count;
      entry.revenue += p.totalRevenue;
      entry.discount += p.totalDiscount;
      if (p.city) entry.cities.add(p.city);
      if (p.parkName) entry.parks.add(p.parkName);
    }
    return Array.from(map.entries())
      .map(([name, d]) => ({
        name,
        count: d.count,
        revenue: d.revenue,
        avgPrice: d.count > 0 ? d.revenue / d.count : 0,
        discount: d.discount,
        cities: Array.from(d.cities),
        parks: Array.from(d.parks),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [partners]);

  // Detail by partner + city
  const partnerDetail = useMemo(() => {
    return [...partners].sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [partners]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-muted-foreground">Parceiros, afiliados e reservas Pro da Multipark</p>
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
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Handshake className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] text-muted-foreground">Reservas Parceiros</span>
              </div>
              <p className="text-xl font-bold text-blue-700">{totals.partnerBookings}</p>
              <p className="text-xs text-muted-foreground">{partnerPct}% do total</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Euro className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] text-muted-foreground">Receita Parceiros</span>
              </div>
              <p className="text-xl font-bold text-blue-700">{fmt(totals.partnerRevenue)}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <ArrowRightLeft className="w-4 h-4 text-green-600" />
                <span className="text-[10px] text-muted-foreground">Reservas Diretas</span>
              </div>
              <p className="text-xl font-bold text-green-700">{totals.directBookings}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Euro className="w-4 h-4 text-green-600" />
                <span className="text-[10px] text-muted-foreground">Receita Direta</span>
              </div>
              <p className="text-xl font-bold text-green-700">{fmt(totals.directRevenue)}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Crown className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] text-muted-foreground">Reservas Pro</span>
              </div>
              <p className="text-xl font-bold text-purple-700">{totals.proBookings}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Euro className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] text-muted-foreground">Receita Pro</span>
              </div>
              <p className="text-xl font-bold text-purple-700">{fmt(totals.proRevenue)}</p>
            </Card>
          </div>

          {/* Partner Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Handshake className="w-4 h-4" /> Parceiros / Afiliados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {partnerSummary.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">Sem reservas de parceiros no período</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">Parceiro</th>
                      <th className="p-2">Cidades</th>
                      <th className="p-2 text-right">Reservas</th>
                      <th className="p-2 text-right">Receita</th>
                      <th className="p-2 text-right">Preço Médio</th>
                      <th className="p-2 text-right">Descontos</th>
                      <th className="p-2 text-right">% Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerSummary.map(p => (
                      <tr key={p.name} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{p.name}</td>
                        <td className="p-2">
                          <div className="flex gap-1 flex-wrap">
                            {p.cities.map(c => (
                              <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-2 text-right tabular-nums">{p.count}</td>
                        <td className="p-2 text-right tabular-nums font-medium">{fmt(p.revenue)}</td>
                        <td className="p-2 text-right tabular-nums">{fmt(p.avgPrice)}</td>
                        <td className="p-2 text-right tabular-nums text-red-600">{fmt(p.discount)}</td>
                        <td className="p-2 text-right tabular-nums">
                          {totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : "0"}%
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/30 font-bold">
                      <td className="p-2">Total Parceiros</td>
                      <td className="p-2"></td>
                      <td className="p-2 text-right">{totals.partnerBookings}</td>
                      <td className="p-2 text-right">{fmt(totals.partnerRevenue)}</td>
                      <td className="p-2 text-right">{totals.partnerBookings > 0 ? fmt(totals.partnerRevenue / totals.partnerBookings) : "—"}</td>
                      <td className="p-2 text-right text-red-600">{fmt(partnerSummary.reduce((s, p) => s + p.discount, 0))}</td>
                      <td className="p-2 text-right">{totalRevenue > 0 ? ((totals.partnerRevenue / totalRevenue) * 100).toFixed(1) : "0"}%</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Detail by partner + city + park */}
          {partnerDetail.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Detalhe por Parceiro / Cidade / Parque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs">
                      <th className="p-2">Parceiro</th>
                      <th className="p-2">Cidade</th>
                      <th className="p-2">Parque</th>
                      <th className="p-2 text-right">Reservas</th>
                      <th className="p-2 text-right">Receita</th>
                      <th className="p-2 text-right">Preço Médio</th>
                      <th className="p-2 text-right">Descontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerDetail.map((p, i) => (
                      <tr key={i} className="border-b hover:bg-muted/50">
                        <td className="p-2">{p.campaign}</td>
                        <td className="p-2 text-muted-foreground">{p.city ?? "—"}</td>
                        <td className="p-2 text-muted-foreground">{p.parkName ?? "—"}</td>
                        <td className="p-2 text-right tabular-nums">{p.count}</td>
                        <td className="p-2 text-right tabular-nums">{fmt(p.totalRevenue)}</td>
                        <td className="p-2 text-right tabular-nums">{fmt(p.avgPrice)}</td>
                        <td className="p-2 text-right tabular-nums text-red-600">{fmt(p.totalDiscount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Pro Bookings */}
          {proBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-600" /> Reservas Pro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">Parque</th>
                      <th className="p-2">Cidade</th>
                      <th className="p-2 text-right">Reservas</th>
                      <th className="p-2 text-right">Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proBookings.map((p, i) => (
                      <tr key={i} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{p.parkName}</td>
                        <td className="p-2 text-muted-foreground">{p.city}</td>
                        <td className="p-2 text-right tabular-nums">{p.count}</td>
                        <td className="p-2 text-right tabular-nums font-medium">{fmt(p.totalRevenue)}</td>
                      </tr>
                    ))}
                    <tr className="bg-muted/30 font-bold">
                      <td className="p-2">Total Pro</td>
                      <td className="p-2"></td>
                      <td className="p-2 text-right">{totals.proBookings}</td>
                      <td className="p-2 text-right">{fmt(totals.proRevenue)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
