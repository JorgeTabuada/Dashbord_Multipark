import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Handshake, Link2, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const fmtEur = (v: number) => v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

export default function PartnerInferPage() {
  const utils = trpc.useUtils();
  const inferQ = trpc.partnerships.inferList.useQuery();
  const partnersQ = trpc.partnerships.list.useQuery();

  const [linkTarget, setLinkTarget] = useState<{
    multiparkPartnerId: string;
    suggestedName: string;
    bookings: number;
    totalValue: number;
  } | null>(null);

  const inferred = inferQ.data ?? [];
  const partners = partnersQ.data ?? [];

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Handshake className="h-6 w-6 text-purple-600" />
          Inferir Parceiros
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          PartnerIds da API Multipark com nome sugerido a partir de paymentMethod e remarks.
          Associa a um parceiro nosso para que o nome real apareça em vez de "Unknown User".
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {inferred.length} partnerIds distintos · {inferred.reduce((s, x) => s + x.bookings, 0)} reservas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inferQ.isLoading ? (
            <p className="text-sm text-muted-foreground">A carregar...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-muted-foreground">
                    <th className="text-left py-2 px-2">Sugestão</th>
                    <th className="text-left py-2 px-2">Pagamento (top)</th>
                    <th className="text-left py-2 px-2">Remarks (amostra)</th>
                    <th className="text-right py-2 px-2">Reservas</th>
                    <th className="text-right py-2 px-2">€ Total</th>
                    <th className="text-left py-2 px-2">PartnerId</th>
                    <th className="text-right py-2 px-2">Acção</th>
                  </tr>
                </thead>
                <tbody>
                  {inferred.map(r => (
                    <tr key={r.multiparkPartnerId} className="border-b hover:bg-muted/30">
                      <td className="py-2 px-2 font-medium">
                        {r.linkedPartnershipId ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            {r.linkedPartnershipName}
                          </span>
                        ) : (
                          r.suggestedName
                        )}
                      </td>
                      <td className="py-2 px-2 text-xs">
                        {r.paymentMethod ? (
                          <Badge variant="outline" className="text-[10px]">{r.paymentMethod}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-xs text-muted-foreground">
                        {r.remarksSample ? r.remarksSample.slice(0, 40) : "—"}
                      </td>
                      <td className="py-2 px-2 text-right">{r.bookings}</td>
                      <td className="py-2 px-2 text-right font-medium">{fmtEur(r.totalValue)}</td>
                      <td className="py-2 px-2 font-mono text-[10px] text-muted-foreground">
                        {r.multiparkPartnerId.slice(0, 16)}…
                      </td>
                      <td className="py-2 px-2 text-right">
                        {r.linkedPartnershipId ? (
                          <span className="text-xs text-muted-foreground">associado</span>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setLinkTarget(r)}>
                            <Link2 className="h-3 w-3 mr-1" /> Associar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {linkTarget && (
        <LinkDialog
          target={linkTarget}
          partners={partners}
          onClose={() => setLinkTarget(null)}
          onSaved={(updated) => {
            toast.success(`Parceiro associado — ${updated} reservas atualizadas`);
            utils.partnerships.inferList.invalidate();
            utils.partnerships.list.invalidate();
            setLinkTarget(null);
          }}
        />
      )}
    </div>
  );
}

function LinkDialog({
  target,
  partners,
  onClose,
  onSaved,
}: {
  target: { multiparkPartnerId: string; suggestedName: string; bookings: number; totalValue: number };
  partners: any[];
  onClose: () => void;
  onSaved: (updated: number) => void;
}) {
  const create = trpc.partnerships.create.useMutation();
  const link = trpc.partnerships.linkMultiparkPartnerId.useMutation();

  const [mode, setMode] = useState<"new" | "existing">("new");
  const [name, setName] = useState(target.suggestedName);
  const [existingId, setExistingId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      let partnershipId: number;
      if (mode === "new") {
        const r = await create.mutateAsync({
          name: name.trim(),
          partnerType: "agency",
        });
        partnershipId = (r as any).id;
      } else {
        partnershipId = parseInt(existingId, 10);
      }
      if (!partnershipId) {
        toast.error("Escolhe ou cria um parceiro");
        return;
      }
      const result = await link.mutateAsync({
        partnershipId,
        multiparkPartnerId: target.multiparkPartnerId,
        applyToBookings: true,
      });
      onSaved(result.updated);
    } catch (e: any) {
      toast.error(e.message ?? "Erro");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Associar partnerId a um parceiro</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="rounded-md border p-3 bg-muted/40">
            <div className="font-mono text-xs">{target.multiparkPartnerId}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {target.bookings} reservas · {fmtEur(target.totalValue)} · sugestão: <strong>{target.suggestedName}</strong>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={mode === "new" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("new")}
            >
              <Plus className="h-3 w-3 mr-1" /> Criar novo
            </Button>
            <Button
              variant={mode === "existing" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("existing")}
            >
              <Link2 className="h-3 w-3 mr-1" /> Associar a existente
            </Button>
          </div>

          {mode === "new" ? (
            <div>
              <Label className="text-xs">Nome do parceiro</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Parkos, Onepark, ..." />
            </div>
          ) : (
            <div>
              <Label className="text-xs">Parceiro existente</Label>
              <Select value={existingId} onValueChange={setExistingId}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {partners.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} {p.multiparkPartnerId ? " (já tem ID)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={submitting || (mode === "new" ? !name.trim() : !existingId)}>
            {submitting ? "A gravar..." : "Gravar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
