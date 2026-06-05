import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function MultiparkInspectPage() {
  const [externalId, setExternalId] = useState("");
  const [enabled, setEnabled] = useState(false);

  const q = trpc.multipark.inspectBooking.useQuery(
    { externalId: externalId.trim() },
    { enabled, retry: false },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalId.trim()) return;
    setEnabled(true);
    q.refetch();
  };

  return (
    <div className="p-6 space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-blue-600" />
          Inspecionar Reserva (debug)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mostra o JSON cru que a API Multipark devolve para uma reserva.
          Tenta cada parque configurado até encontrar.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="ext-id" className="text-xs">External ID (ex: cmq194vdr0bdvnv2zks8v8mwe)</Label>
              <Input
                id="ext-id"
                value={externalId}
                onChange={(e) => { setExternalId(e.target.value); setEnabled(false); }}
                placeholder="cm..."
              />
            </div>
            <Button type="submit" disabled={!externalId.trim() || q.isFetching}>
              {q.isFetching ? "A buscar..." : "Buscar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {q.error && (
        <Card>
          <CardContent className="p-4 text-sm text-red-700">
            {q.error.message}
          </CardContent>
        </Card>
      )}

      {q.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {q.data.park} — parkId: <span className="font-mono text-sm">{q.data.parkId}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted/40 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(q.data.booking, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
