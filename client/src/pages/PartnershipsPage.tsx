import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Handshake, Plus, Trash2, Pencil, Mail, Phone, Euro,
  Users, ArrowLeft, ChevronRight, FileText, AlertTriangle,
  Send, CheckCircle2, Clock, Building2, Globe, Briefcase,
  CalendarClock, Receipt, TrendingUp, XCircle
} from "lucide-react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  aggregator: { label: "Agregador", color: "bg-blue-100 text-blue-700", icon: Globe },
  agency: { label: "Agência", color: "bg-purple-100 text-purple-700", icon: Building2 },
  corporate: { label: "Empresarial", color: "bg-emerald-100 text-emerald-700", icon: Briefcase },
  retainer: { label: "Avença", color: "bg-amber-100 text-amber-700", icon: CalendarClock },
  pro_client: { label: "Cliente Pro", color: "bg-green-100 text-green-700", icon: Users },
  other: { label: "Outro", color: "bg-gray-100 text-gray-700", icon: Handshake },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "Ativo", color: "bg-green-100 text-green-700" },
  inactive: { label: "Inativo", color: "bg-gray-100 text-gray-700" },
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
};

const INVOICE_STATUS: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-600", icon: FileText },
  sent: { label: "Enviada", color: "bg-blue-100 text-blue-700", icon: Send },
  paid: { label: "Paga", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  overdue: { label: "Vencida", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  cancelled: { label: "Cancelada", color: "bg-gray-200 text-gray-500", icon: XCircle },
};

const TABS = [
  { value: "dashboard", label: "Dashboard" },
  { value: "aggregator", label: "Agregadores" },
  { value: "agency", label: "Agências" },
  { value: "corporate", label: "Empresarial" },
  { value: "retainer", label: "Avenças" },
];

const formatCents = (cents: number) => {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(cents / 100);
};

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function PartnershipsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (selectedId) {
    return <PartnershipDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-muted-foreground text-sm">Gestão de parceiros, faturação e cobranças</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nova Parceria
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            {TABS.map(t => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <DashboardTab onSelectPartner={setSelectedId} />
          </TabsContent>

          {["aggregator", "agency", "corporate", "retainer"].map(type => (
            <TabsContent key={type} value={type} className="mt-4">
              <PartnerTypeTab type={type} onSelectPartner={setSelectedId} onCreateNew={() => setShowCreate(true)} />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {showCreate && (
        <CreatePartnershipDialog
          defaultType={activeTab !== "dashboard" ? activeTab : undefined}
          onClose={() => setShowCreate(false)}
        />
      )}
    </>
  );
}

// ─── DASHBOARD TAB ───────────────────────────────────────────────────────────
function DashboardTab({ onSelectPartner }: { onSelectPartner: (id: number) => void }) {
  const { data: stats } = trpc.partnerships.dashboardStats.useQuery();

  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const overduePartners = stats.partnerSummaries.filter((p: any) => p.hasOverdue);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Parceiros" value={String(stats.totalPartners)} icon={<Handshake className="w-5 h-5 text-indigo-500" />} />
        <KpiCard label="Ativos" value={String(stats.activePartners)} icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} />
        <KpiCard label="A Receber" value={formatCents(stats.totalPending)} icon={<Clock className="w-5 h-5 text-blue-500" />} />
        <KpiCard label="Em Atraso" value={formatCents(stats.totalOverdue)} icon={<AlertTriangle className="w-5 h-5 text-red-500" />} alert={stats.totalOverdue > 0} />
        <KpiCard label="Recebido" value={formatCents(stats.totalPaid)} icon={<Euro className="w-5 h-5 text-green-500" />} />
        <KpiCard label="Reservas" value={formatCents(stats.totalBookings)} icon={<TrendingUp className="w-5 h-5 text-amber-500" />} />
      </div>

      {/* Distribution by type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" /> Por Tipo
          </h3>
          <div className="space-y-3">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
              const count = stats.byType[key] || 0;
              if (count === 0) return null;
              const Icon = cfg.icon;
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{cfg.label}</span>
                  </div>
                  <Badge className={cfg.color}>{count}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Overdue Alerts */}
        <Card className={`p-5 ${overduePartners.length > 0 ? "border-red-200 bg-red-50/30" : ""}`}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${overduePartners.length > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            Alertas de Cobrança
            {overduePartners.length > 0 && (
              <Badge className="bg-red-100 text-red-700 ml-auto">{overduePartners.length}</Badge>
            )}
          </h3>
          {overduePartners.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Sem faturas vencidas</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {overduePartners.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-red-100 cursor-pointer hover:bg-red-50 transition-colors"
                  onClick={() => onSelectPartner(p.id)}
                >
                  <div>
                    <span className="text-sm font-medium">{p.name}</span>
                    <Badge className={`ml-2 text-xs ${TYPE_CONFIG[p.partnerType]?.color}`}>
                      {TYPE_CONFIG[p.partnerType]?.label}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{formatCents(p.invoicesOverdue)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* All partners summary table */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4" /> Resumo por Parceiro
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4">Parceiro</th>
                <th className="pb-2 pr-4">Tipo</th>
                <th className="pb-2 pr-4 text-right">Reservas</th>
                <th className="pb-2 pr-4 text-right">Pendente</th>
                <th className="pb-2 pr-4 text-right">Em Atraso</th>
                <th className="pb-2 pr-4 text-right">Pago</th>
                <th className="pb-2 text-right">Faturas</th>
              </tr>
            </thead>
            <tbody>
              {stats.partnerSummaries.map((p: any) => (
                <tr
                  key={p.id}
                  className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onSelectPartner(p.id)}
                >
                  <td className="py-2 pr-4 font-medium">{p.name}</td>
                  <td className="py-2 pr-4">
                    <Badge className={`text-xs ${TYPE_CONFIG[p.partnerType]?.color}`}>
                      {TYPE_CONFIG[p.partnerType]?.label}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4 text-right">{formatCents(p.totalBookings)}</td>
                  <td className="py-2 pr-4 text-right">{formatCents(p.invoicesPending)}</td>
                  <td className={`py-2 pr-4 text-right ${p.invoicesOverdue > 0 ? "text-red-600 font-semibold" : ""}`}>
                    {formatCents(p.invoicesOverdue)}
                  </td>
                  <td className="py-2 pr-4 text-right text-green-600">{formatCents(p.invoicesPaid)}</td>
                  <td className="py-2 text-right">{p.invoiceCount}</td>
                </tr>
              ))}
              {stats.partnerSummaries.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Sem parceiros registados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, icon, alert }: { label: string; value: string; icon: React.ReactNode; alert?: boolean }) {
  return (
    <Card className={`p-4 ${alert ? "border-red-200 bg-red-50/50" : ""}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className={`text-lg font-bold ${alert ? "text-red-600" : ""}`}>{value}</p>
    </Card>
  );
}

// ─── PARTNER TYPE TAB ────────────────────────────────────────────────────────
function PartnerTypeTab({ type, onSelectPartner, onCreateNew }: { type: string; onSelectPartner: (id: number) => void; onCreateNew: () => void }) {
  const { data: partnerships = [], isLoading } = trpc.partnerships.list.useQuery({ partnerType: type });
  const deleteMut = trpc.partnerships.delete.useMutation();
  const utils = trpc.useUtils();

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Eliminar esta parceria e todas as transações?")) return;
    await deleteMut.mutateAsync({ id });
    utils.partnerships.list.invalidate();
    utils.partnerships.dashboardStats.invalidate();
    toast.success("Parceria eliminada");
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  const cfg = TYPE_CONFIG[type];
  const Icon = cfg?.icon || Handshake;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{cfg?.label || type}</h2>
          <Badge variant="secondary">{partnerships.length}</Badge>
        </div>
        <Button size="sm" onClick={onCreateNew}><Plus className="w-4 h-4 mr-1" /> Novo</Button>
      </div>

      {partnerships.length === 0 ? (
        <Card className="p-10 text-center">
          <Icon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Sem {cfg?.label?.toLowerCase() || "parceiros"} registados</p>
          <Button variant="outline" className="mt-3" onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partnerships.map((p: any) => (
            <Card
              key={p.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectPartner(p.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{p.name}</h3>
                      <Badge className={STATUS_CONFIG[p.status]?.color}>{STATUS_CONFIG[p.status]?.label}</Badge>
                    </div>
                    {p.nif && <p className="text-xs text-muted-foreground">NIF: {p.nif}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {p.contactName && <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.contactName}</div>}
                  {p.contactEmail && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.contactEmail}</div>}
                  {p.contactPhone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.contactPhone}</div>}
                  {p.commissionRate > 0 && <div className="flex items-center gap-1"><Euro className="w-3 h-3" /> Comissão: {p.commissionRate / 100}%</div>}
                  {p.monthlyFee > 0 && <div className="flex items-center gap-1"><CalendarClock className="w-3 h-3" /> Mensalidade: {formatCents(p.monthlyFee)}</div>}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="ghost" onClick={(e) => handleDelete(e, p.id)}>
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PARTNERSHIP DETAIL ──────────────────────────────────────────────────────
function PartnershipDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const { data: partner } = trpc.partnerships.getById.useQuery({ id });
  const { data: transactions = [] } = trpc.partnerships.getTransactions.useQuery({ partnershipId: id });
  const { data: invoices = [] } = trpc.partnerships.listInvoices.useQuery({ partnershipId: id });
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [detailTab, setDetailTab] = useState("invoices");
  const updateMut = trpc.partnerships.update.useMutation();
  const updateInvoiceMut = trpc.partnerships.updateInvoice.useMutation();
  const deleteInvoiceMut = trpc.partnerships.deleteInvoice.useMutation();
  const utils = trpc.useUtils();

  const totalBookings = transactions.filter((t: any) => t.transactionType === "booking").reduce((s: number, t: any) => s + (t.amount || 0), 0);
  const totalCommissions = transactions.filter((t: any) => t.transactionType === "commission").reduce((s: number, t: any) => s + (t.amount || 0), 0);
  const totalPayments = transactions.filter((t: any) => t.transactionType === "payment").reduce((s: number, t: any) => s + (t.amount || 0), 0);
  const pendingBalance = totalCommissions - totalPayments;

  const pendingInvoices = invoices.filter((i: any) => i.status === "sent");
  const overdueInvoices = invoices.filter((i: any) => i.status === "overdue");
  const paidInvoices = invoices.filter((i: any) => i.status === "paid");

  const handleUpdateInvoiceStatus = async (invoiceId: number, status: string) => {
    try {
      await updateInvoiceMut.mutateAsync({ id: invoiceId, status: status as any });
      utils.partnerships.listInvoices.invalidate();
      utils.partnerships.dashboardStats.invalidate();
      toast.success(`Fatura marcada como ${INVOICE_STATUS[status]?.label}`);
    } catch { toast.error("Erro ao atualizar fatura"); }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!confirm("Eliminar esta fatura?")) return;
    await deleteInvoiceMut.mutateAsync({ id: invoiceId });
    utils.partnerships.listInvoices.invalidate();
    utils.partnerships.dashboardStats.invalidate();
    toast.success("Fatura eliminada");
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    try {
      await updateMut.mutateAsync({
        id,
        name: editForm.name,
        contactName: editForm.contactName || undefined,
        contactEmail: editForm.contactEmail || undefined,
        contactPhone: editForm.contactPhone || undefined,
        nif: editForm.nif || undefined,
        commissionRate: editForm.commissionRate ? Math.round(parseFloat(editForm.commissionRate) * 100) : undefined,
        monthlyFee: editForm.monthlyFee ? Math.round(parseFloat(editForm.monthlyFee) * 100) : undefined,
        billingAgreement: editForm.billingAgreement || undefined,
        notes: editForm.notes || undefined,
        status: editForm.status,
      });
      utils.partnerships.getById.invalidate({ id });
      utils.partnerships.list.invalidate();
      utils.partnerships.dashboardStats.invalidate();
      setIsEditing(false);
      toast.success("Parceria atualizada");
    } catch { toast.error("Erro ao atualizar"); }
  };

  if (!partner) {
    return (
      <>
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Voltar</Button>
          <h1 className="text-2xl font-bold">{partner.name}</h1>
          <Badge className={TYPE_CONFIG[partner.partnerType]?.color}>{TYPE_CONFIG[partner.partnerType]?.label}</Badge>
          <Badge className={STATUS_CONFIG[partner.status]?.color}>{STATUS_CONFIG[partner.status]?.label}</Badge>
          <Button variant="outline" size="sm" onClick={() => {
            setEditForm({
              name: partner.name || "",
              contactName: partner.contactName || "",
              contactEmail: partner.contactEmail || "",
              contactPhone: partner.contactPhone || "",
              nif: partner.nif || "",
              commissionRate: partner.commissionRate ? String(partner.commissionRate / 100) : "",
              monthlyFee: partner.monthlyFee ? String(partner.monthlyFee / 100) : "",
              billingAgreement: partner.billingAgreement || "",
              notes: partner.notes || "",
              status: partner.status || "active",
            });
            setIsEditing(true);
          }}>
            <Pencil className="w-4 h-4 mr-1" /> Editar
          </Button>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Contacto</h3>
            <div className="space-y-1 text-sm">
              {partner.contactName && <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {partner.contactName}</div>}
              {partner.contactEmail && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {partner.contactEmail}</div>}
              {partner.contactPhone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {partner.contactPhone}</div>}
              {partner.nif && <div className="flex items-center gap-1"><FileText className="w-3 h-3" /> NIF: {partner.nif}</div>}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Financeiro</h3>
            <div className="space-y-1 text-sm">
              {(partner.commissionRate ?? 0) > 0 && <div>Comissão: <strong>{(partner.commissionRate ?? 0) / 100}%</strong></div>}
              {(partner.monthlyFee ?? 0) > 0 && <div>Mensalidade: <strong>{formatCents(partner.monthlyFee ?? 0)}</strong></div>}
              <div>Reservas: <strong>{formatCents(totalBookings)}</strong></div>
            </div>
          </Card>
          <Card className={`p-4 ${overdueInvoices.length > 0 ? "border-red-200 bg-red-50/30" : ""}`}>
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Faturas</h3>
            <div className="space-y-1 text-sm">
              <div>Pendentes: <strong className="text-blue-600">{formatCents(pendingInvoices.reduce((s: number, i: any) => s + i.amount, 0))}</strong></div>
              <div>Vencidas: <strong className={overdueInvoices.length > 0 ? "text-red-600" : ""}>{formatCents(overdueInvoices.reduce((s: number, i: any) => s + i.amount, 0))}</strong></div>
              <div>Pagas: <strong className="text-green-600">{formatCents(paidInvoices.reduce((s: number, i: any) => s + i.amount, 0))}</strong></div>
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Balanço</h3>
            <div className="space-y-1 text-sm">
              <div>Comissões: <strong>{formatCents(totalCommissions)}</strong></div>
              <div>Pagamentos: <strong>{formatCents(totalPayments)}</strong></div>
              <div>Pendente: <strong className={pendingBalance > 0 ? "text-amber-600" : "text-green-600"}>{formatCents(pendingBalance)}</strong></div>
            </div>
          </Card>
        </div>

        {/* Detail Tabs */}
        <Tabs value={detailTab} onValueChange={setDetailTab}>
          <TabsList>
            <TabsTrigger value="invoices">
              Faturas
              {overdueInvoices.length > 0 && <Badge className="ml-1 bg-red-100 text-red-700 text-xs">{overdueInvoices.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowAddInvoice(true)}>
                <Plus className="w-4 h-4 mr-1" /> Nova Fatura
              </Button>
            </div>
            {invoices.length === 0 ? (
              <Card className="p-8 text-center">
                <Receipt className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Sem faturas registadas</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv: any) => {
                  const st = INVOICE_STATUS[inv.status] || INVOICE_STATUS.draft;
                  const StIcon = st.icon;
                  return (
                    <Card key={inv.id} className={`p-4 ${inv.status === "overdue" ? "border-red-200 bg-red-50/20" : ""}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <StIcon className={`w-5 h-5 ${inv.status === "overdue" ? "text-red-500" : inv.status === "paid" ? "text-green-500" : "text-muted-foreground"}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{inv.invoiceNumber || `#${inv.id}`}</span>
                              <Badge className={st.color}>{st.label}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Ref: {String(inv.referenceMonth).padStart(2, "0")}/{inv.referenceYear}
                              {inv.dueDate && <> · Vence: {new Date(inv.dueDate).toLocaleDateString("pt-PT")}</>}
                              {inv.sentAt && <> · Enviada: {new Date(inv.sentAt).toLocaleDateString("pt-PT")}</>}
                              {inv.paidAt && <> · Paga: {new Date(inv.paidAt).toLocaleDateString("pt-PT")}</>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{formatCents(inv.amount)}</span>
                          <div className="flex gap-1">
                            {inv.status === "draft" && (
                              <Button size="sm" variant="outline" onClick={() => handleUpdateInvoiceStatus(inv.id, "sent")}>
                                <Send className="w-3 h-3 mr-1" /> Enviar
                              </Button>
                            )}
                            {inv.status === "sent" && (
                              <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => handleUpdateInvoiceStatus(inv.id, "paid")}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Paga
                              </Button>
                            )}
                            {inv.status === "overdue" && (
                              <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => handleUpdateInvoiceStatus(inv.id, "paid")}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Paga
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteInvoice(inv.id)}>
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {inv.notes && <p className="text-xs text-muted-foreground mt-2 pl-8">{inv.notes}</p>}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowAddTx(true)}>
                <Plus className="w-4 h-4 mr-1" /> Nova Transação
              </Button>
            </div>
            {transactions.length === 0 ? (
              <Card className="p-8 text-center">
                <Euro className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Sem transações</p>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Data</th>
                      <th className="pb-2 pr-4">Tipo</th>
                      <th className="pb-2 pr-4">Descrição</th>
                      <th className="pb-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">{new Date(tx.transactionDate).toLocaleDateString("pt-PT")}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="secondary" className="text-xs">
                            {tx.transactionType === "booking" ? "Reserva" : tx.transactionType === "commission" ? "Comissão" : tx.transactionType === "payment" ? "Pagamento" : "Ajuste"}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">{tx.description || "—"}</td>
                        <td className="py-2 text-right font-medium">{formatCents(tx.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-4">
            <Card className="p-5">
              <h3 className="font-medium mb-2">Acordo de Faturação</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{partner.billingAgreement || "Sem acordo definido"}</p>
              <h3 className="font-medium mt-4 mb-2">Notas</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{partner.notes || "Sem notas"}</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      {isEditing && editForm && (
        <Dialog open onOpenChange={() => setIsEditing(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Editar Parceria</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nome</Label><Input value={editForm.name} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} /></div>
                <div>
                  <Label>Estado</Label>
                  <Select value={editForm.status} onValueChange={(v: any) => setEditForm((f: any) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Contacto</Label><Input value={editForm.contactName} onChange={e => setEditForm((f: any) => ({ ...f, contactName: e.target.value }))} /></div>
                <div><Label>Email</Label><Input type="email" value={editForm.contactEmail} onChange={e => setEditForm((f: any) => ({ ...f, contactEmail: e.target.value }))} /></div>
                <div><Label>Telefone</Label><Input value={editForm.contactPhone} onChange={e => setEditForm((f: any) => ({ ...f, contactPhone: e.target.value }))} /></div>
                <div><Label>NIF</Label><Input value={editForm.nif} onChange={e => setEditForm((f: any) => ({ ...f, nif: e.target.value }))} /></div>
                <div><Label>Comissão (%)</Label><Input type="number" step="0.01" value={editForm.commissionRate} onChange={e => setEditForm((f: any) => ({ ...f, commissionRate: e.target.value }))} /></div>
                <div><Label>Mensalidade (€)</Label><Input type="number" step="0.01" value={editForm.monthlyFee} onChange={e => setEditForm((f: any) => ({ ...f, monthlyFee: e.target.value }))} /></div>
              </div>
              <div><Label>Acordo de Faturação</Label><Textarea value={editForm.billingAgreement} onChange={e => setEditForm((f: any) => ({ ...f, billingAgreement: e.target.value }))} rows={2} /></div>
              <div><Label>Notas</Label><Textarea value={editForm.notes} onChange={e => setEditForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit} disabled={updateMut.isPending}>{updateMut.isPending ? "A guardar..." : "Guardar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Transaction Dialog */}
      {showAddTx && <AddTransactionDialog partnershipId={id} onClose={() => setShowAddTx(false)} />}

      {/* Add Invoice Dialog */}
      {showAddInvoice && <AddInvoiceDialog partnershipId={id} onClose={() => setShowAddInvoice(false)} />}
    </>
  );
}

// ─── ADD TRANSACTION DIALOG ──────────────────────────────────────────────────
function AddTransactionDialog({ partnershipId, onClose }: { partnershipId: number; onClose: () => void }) {
  const [form, setForm] = useState({ transactionType: "booking" as string, description: "", amount: "", transactionDate: new Date().toISOString().slice(0, 10) });
  const addTxMut = trpc.partnerships.addTransaction.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    if (!form.amount) { toast.error("Valor obrigatório"); return; }
    try {
      await addTxMut.mutateAsync({
        partnershipId,
        transactionType: form.transactionType as any,
        description: form.description || undefined,
        amount: Math.round(parseFloat(form.amount) * 100),
        transactionDate: form.transactionDate || undefined,
      });
      utils.partnerships.getTransactions.invalidate();
      utils.partnerships.dashboardStats.invalidate();
      toast.success("Transação adicionada");
      onClose();
    } catch { toast.error("Erro"); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova Transação</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.transactionType} onValueChange={v => setForm(f => ({ ...f, transactionType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">Reserva</SelectItem>
                  <SelectItem value="commission">Comissão</SelectItem>
                  <SelectItem value="payment">Pagamento</SelectItem>
                  <SelectItem value="adjustment">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Valor (€)</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
          </div>
          <div><Label>Descrição</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><Label>Data</Label><Input type="date" value={form.transactionDate} onChange={e => setForm(f => ({ ...f, transactionDate: e.target.value }))} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={addTxMut.isPending}>{addTxMut.isPending ? "A criar..." : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── ADD INVOICE DIALOG ──────────────────────────────────────────────────────
function AddInvoiceDialog({ partnershipId, onClose }: { partnershipId: number; onClose: () => void }) {
  const now = new Date();
  const [form, setForm] = useState({
    invoiceNumber: "",
    amount: "",
    referenceMonth: String(now.getMonth() + 1),
    referenceYear: String(now.getFullYear()),
    dueDate: "",
    notes: "",
  });
  const createMut = trpc.partnerships.createInvoice.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    if (!form.amount) { toast.error("Valor obrigatório"); return; }
    try {
      await createMut.mutateAsync({
        partnershipId,
        invoiceNumber: form.invoiceNumber || undefined,
        amount: Math.round(parseFloat(form.amount) * 100),
        referenceMonth: parseInt(form.referenceMonth),
        referenceYear: parseInt(form.referenceYear),
        dueDate: form.dueDate || undefined,
        notes: form.notes || undefined,
      });
      utils.partnerships.listInvoices.invalidate();
      utils.partnerships.dashboardStats.invalidate();
      toast.success("Fatura criada");
      onClose();
    } catch { toast.error("Erro ao criar fatura"); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova Fatura</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nº Fatura</Label><Input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} placeholder="FT 2026/001" /></div>
            <div><Label>Valor (€) *</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
            <div>
              <Label>Mês Ref.</Label>
              <Select value={form.referenceMonth} onValueChange={v => setForm(f => ({ ...f, referenceMonth: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {new Date(2026, i).toLocaleString("pt-PT", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Ano Ref.</Label><Input type="number" value={form.referenceYear} onChange={e => setForm(f => ({ ...f, referenceYear: e.target.value }))} /></div>
          </div>
          <div><Label>Data Vencimento</Label><Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
          <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createMut.isPending}>{createMut.isPending ? "A criar..." : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── CREATE PARTNERSHIP DIALOG ───────────────────────────────────────────────
function CreatePartnershipDialog({ defaultType, onClose }: { defaultType?: string; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    partnerType: defaultType || "aggregator",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    nif: "",
    commissionRate: "",
    monthlyFee: "",
    billingAgreement: "",
    notes: "",
  });
  const createMut = trpc.partnerships.create.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Nome obrigatório"); return; }
    try {
      await createMut.mutateAsync({
        name: form.name,
        partnerType: form.partnerType as any,
        contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        nif: form.nif || undefined,
        commissionRate: form.commissionRate ? Math.round(parseFloat(form.commissionRate) * 100) : undefined,
        monthlyFee: form.monthlyFee ? Math.round(parseFloat(form.monthlyFee) * 100) : undefined,
        billingAgreement: form.billingAgreement || undefined,
        notes: form.notes || undefined,
      });
      utils.partnerships.list.invalidate();
      utils.partnerships.dashboardStats.invalidate();
      toast.success("Parceria criada");
      onClose();
    } catch (e: any) { toast.error(e.message || "Erro"); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nova Parceria</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.partnerType} onValueChange={(v: any) => setForm(f => ({ ...f, partnerType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Contacto</Label><Input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} /></div>
            <div><Label>Telefone</Label><Input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} /></div>
            <div><Label>NIF</Label><Input value={form.nif} onChange={e => setForm(f => ({ ...f, nif: e.target.value }))} /></div>
            <div><Label>Comissão (%)</Label><Input type="number" step="0.01" value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: e.target.value }))} /></div>
            <div><Label>Mensalidade (€)</Label><Input type="number" step="0.01" value={form.monthlyFee} onChange={e => setForm(f => ({ ...f, monthlyFee: e.target.value }))} /></div>
          </div>
          <div><Label>Acordo de Faturação</Label><Textarea value={form.billingAgreement} onChange={e => setForm(f => ({ ...f, billingAgreement: e.target.value }))} rows={2} /></div>
          <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createMut.isPending}>{createMut.isPending ? "A criar..." : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
