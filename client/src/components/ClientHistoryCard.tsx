import { trpc } from "@/lib/trpc";
import { fmtPTDate } from "@/lib/lisbonTime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Car, MessageSquareWarning, PackageSearch, Star, Loader2 } from "lucide-react";

type Props = {
  email?: string | null;
  phone?: string | null;
  plate?: string | null;
  name?: string | null;
  /** id da reclamação/perdido/crítica atual, para não a destacar a ela própria. */
  className?: string;
};

const d = (s?: string | null) => fmtPTDate(s);

/**
 * Mostra TODO o histórico de um cliente (reservas, reclamações, perdidos,
 * críticas) cruzado por email / telefone / matrícula / nome. Reutilizável nos
 * detalhes de Reclamações, Perdidos & Achados e Críticas.
 */
export default function ClientHistoryCard({ email, phone, plate, name, className }: Props) {
  const hasKey = !!(email || phone || plate || name);
  const { data, isLoading } = trpc.clients.history.useQuery(
    { email: email ?? null, phone: phone ?? null, plate: plate ?? null, name: name ?? null },
    { enabled: hasKey },
  );

  if (!hasKey) return null;

  const counts = data
    ? { b: data.bookings.length, c: data.complaints.length, l: data.lostFound.length, r: data.reviews.length }
    : { b: 0, c: 0, l: 0, r: 0 };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Histórico do cliente
          {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
        </CardTitle>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Badge variant="outline"><Car className="w-3 h-3 mr-1" />{counts.b} reservas</Badge>
          <Badge variant="outline"><MessageSquareWarning className="w-3 h-3 mr-1" />{counts.c} reclamações</Badge>
          <Badge variant="outline"><PackageSearch className="w-3 h-3 mr-1" />{counts.l} perdidos</Badge>
          <Badge variant="outline"><Star className="w-3 h-3 mr-1" />{counts.r} críticas</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!isLoading && counts.b + counts.c + counts.l + counts.r === 0 && (
          <p className="text-muted-foreground text-xs">Sem histórico associado a este cliente.</p>
        )}

        {counts.b > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Reservas</div>
            <div className="space-y-0.5 max-h-40 overflow-y-auto">
              {data!.bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2 border-b last:border-0 py-0.5">
                  <span className="font-mono">#{b.bookingNumber}{b.licensePlate ? ` · ${b.licensePlate}` : ""}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{b.parkName ?? b.city ?? ""} · {d(b.checkIn)} {b.status ? `· ${b.status}` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {counts.c > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Reclamações</div>
            <div className="space-y-0.5 max-h-32 overflow-y-auto">
              {data!.complaints.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 border-b last:border-0 py-0.5">
                  <span className="truncate">{c.title}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{c.status} · {d(c.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {counts.l > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Perdidos & Achados</div>
            <div className="space-y-0.5 max-h-32 overflow-y-auto">
              {data!.lostFound.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-2 border-b last:border-0 py-0.5">
                  <span className="truncate">{l.itemType} — {l.description?.slice(0, 60)}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{l.status} · {d(l.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {counts.r > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Críticas</div>
            <div className="space-y-0.5 max-h-32 overflow-y-auto">
              {data!.reviews.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 border-b last:border-0 py-0.5">
                  <span className="truncate">{"★".repeat(Math.max(0, r.rating))} {r.reviewText?.slice(0, 60)}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{r.status} · {d(r.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
